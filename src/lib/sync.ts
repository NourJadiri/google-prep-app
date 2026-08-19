/* Cross-device sync against the D1-backed /api/state endpoint.
 *
 * localStorage stays the source of truth and every write path in the app is
 * untouched — this module only mirrors the blob to the cloud when it can, and
 * pulls a newer copy down when one exists. No network, no problem: edits stamp
 * a local `editedAt`, and the moment a push succeeds the stamp is acknowledged
 * in `serverAt`. `editedAt > serverAt` *is* the dirty flag, and it lives in
 * localStorage too, so a session that ends offline pushes on the next boot.
 *
 * Conflicts are last-write-wins on the whole blob, judged by the server: a
 * push that loses gets the winning copy back and adopts it. Wall clocks race
 * only when two devices edit while apart, which for one person and a study
 * plan is the acceptable edge — FOLLOW-UPS has the sharper version.
 *
 * Like storage.ts, nothing here ever throws its way up into React. A failed
 * fetch flips the status to "error" and arms a retry; that's the whole drama.
 */

import type { PersistedData } from "../types";

const CFG_KEY = "onsite-express-sync-v1";
const PUSH_DEBOUNCE_MS = 4_000;
const RETRY_MS = 30_000;
/* Don't re-pull on every tab flick; a phone habit is many of those a minute. */
const WAKE_MIN_MS = 30_000;

/* Mirrors the server's rule so a typo fails here, not with a 400. */
const CODE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{7,63}$/;

const url = (code: string) => `/api/state/${encodeURIComponent(code)}`;

interface SyncConfig {
  code: string;
  /** Stamp of the newest local edit (or of the copy we adopted). */
  editedAt: number;
  /** Newest stamp the server has acknowledged as ours. */
  serverAt: number;
  /** Last successful exchange, for the status line. */
  okAt: number;
  /** Set between "connect with a code" and first contact: the cloud copy
   *  wins even if this device edits before the network shows up. */
  joining?: true;
}

export type SyncPhase = "off" | "synced" | "pending" | "working" | "error";

export interface SyncStatus {
  enabled: boolean;
  code: string | null;
  phase: SyncPhase;
  /** ms epoch of the last successful exchange, 0 if never. */
  syncedAt: number;
}

export type SyncOutcome = "adopted" | "pushed" | "clean" | "failed";

/** Handed the raw cloud blob; returns true only if it vetted and adopted it. */
type OnRemote = (raw: unknown) => boolean;

/* ------------------------------ module state ----------------------------- */

let cfg: SyncConfig | null = loadCfg();
let latest: PersistedData | null = null;
/** The exact object handed to the store by an adoption, so the store's
 *  save-effect can tell "the cloud did this" from a real local edit. */
let adopted: PersistedData | null = null;
let onRemote: OnRemote | null = null;
let inflight = false;
let failed = false;
/** The cloud copy exists but didn't vet (a future export version, say).
 *  Neither side should overwrite the other, so sync parks until the app
 *  catches up or the reader disconnects. */
let held = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let onlineListener: (() => void) | null = null;

const listeners = new Set<() => void>();
let snapshot: SyncStatus = build();

/* -------------------------------- plumbing ------------------------------- */

function loadCfg(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(CFG_KEY);
    if (!raw) return null;
    const c: unknown = JSON.parse(raw);
    if (!c || typeof c !== "object") return null;
    const { code, editedAt, serverAt, okAt, joining } = c as Record<string, unknown>;
    if (typeof code !== "string" || !CODE_RE.test(code)) return null;
    const num = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : 0);
    return {
      code,
      editedAt: num(editedAt),
      serverAt: num(serverAt),
      okAt: num(okAt),
      ...(joining === true ? { joining: true as const } : {}),
    };
  } catch {
    return null;
  }
}

function saveCfg(): void {
  try {
    if (cfg) localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
    else localStorage.removeItem(CFG_KEY);
  } catch {
    /* No storage here — sync still works, it just won't survive a reload. */
  }
}

function build(): SyncStatus {
  return {
    enabled: !!cfg,
    code: cfg ? cfg.code : null,
    phase: !cfg
      ? "off"
      : inflight
        ? "working"
        : failed || held
          ? "error"
          : cfg.editedAt > cfg.serverAt
            ? "pending"
            : "synced",
    syncedAt: cfg ? cfg.okAt : 0,
  };
}

function emit(): void {
  snapshot = build();
  listeners.forEach((l) => l());
}

export function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getStatus(): SyncStatus {
  return snapshot;
}

function newCode(): string {
  try {
    if (crypto.randomUUID) return crypto.randomUUID();
    const b = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  } catch {
    /* No crypto (ancient embed): a weak code beats no sync. */
    return `oe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Monotonic per device, so a clock step backwards can't resurrect old data. */
const stamp = (prev: number): number => Math.max(Date.now(), prev + 1);

function clearTimers(): void {
  if (pushTimer !== null) clearTimeout(pushTimer);
  if (retryTimer !== null) clearTimeout(retryTimer);
  pushTimer = null;
  retryTimer = null;
}

function armRetry(): void {
  if (retryTimer !== null) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void syncNow();
  }, RETRY_MS);
}

/* ------------------------------ the exchanges ---------------------------- */

const isObj = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object";

/** True if the cloud copy was vetted and taken; false parks the sync. */
function adopt(raw: unknown, updatedAt: number): boolean {
  if (!cfg) return false;
  if (onRemote && onRemote(raw)) {
    cfg.editedAt = updatedAt;
    cfg.serverAt = updatedAt;
    delete cfg.joining;
    held = false;
    return true;
  }
  held = true;
  return false;
}

async function push(keepalive = false): Promise<SyncOutcome> {
  const c = cfg;
  if (!c || !latest || inflight || held) return "failed";
  if (c.editedAt <= c.serverAt) return "clean";
  const sent = c.editedAt;
  const body = JSON.stringify({ updatedAt: sent, data: latest });
  inflight = true;
  emit();
  try {
    const res = await fetch(url(c.code), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body,
      keepalive,
    });
    if (!res.ok) throw new Error(`push ${res.status}`);
    const out: unknown = await res.json();
    if (!isObj(out)) throw new Error("push: bad response");
    if (cfg !== c) return "failed"; // disconnected mid-flight; drop the result
    failed = false;
    c.okAt = Date.now();
    let outcome: SyncOutcome;
    if (out["applied"] === true) {
      c.serverAt = Math.max(c.serverAt, sent);
      delete c.joining;
      outcome = "pushed";
    } else {
      /* Another device wrote a newer copy while we were away: take it. */
      const at = out["updatedAt"];
      adopt(out["data"], typeof at === "number" && Number.isFinite(at) ? at : sent);
      outcome = "adopted";
    }
    saveCfg();
    /* Edited again while the request was out? One more round. */
    if (c.editedAt > c.serverAt && !held) schedulePush();
    return outcome;
  } catch {
    if (cfg === c) {
      failed = true;
      armRetry();
    }
    return "failed";
  } finally {
    inflight = false;
    emit();
  }
}

function schedulePush(): void {
  if (!cfg) return;
  if (pushTimer !== null) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void push();
  }, PUSH_DEBOUNCE_MS);
}

/** Pull, reconcile, and push whatever survives. The one entry point every
 *  trigger funnels through: boot, retry, regained network, tab focus. */
export async function syncNow(preferRemote = false): Promise<SyncOutcome> {
  const c = cfg;
  if (!c || inflight) return "failed";
  const remoteWins = preferRemote || c.joining === true;
  inflight = true;
  emit();
  let outcome: SyncOutcome = "clean";
  try {
    const res = await fetch(url(c.code), { method: "GET" });
    if (res.status === 404) {
      /* Nothing in the cloud yet — this device's copy seeds it. */
      if (c.editedAt === 0) c.editedAt = stamp(c.editedAt);
      delete c.joining;
      held = false;
    } else {
      if (!res.ok) throw new Error(`pull ${res.status}`);
      const out: unknown = await res.json();
      if (!isObj(out) || typeof out["updatedAt"] !== "number") {
        throw new Error("pull: bad response");
      }
      if (cfg !== c) return "failed";
      const at = out["updatedAt"];
      if (remoteWins || at > c.editedAt) {
        outcome = adopt(out["data"], at) ? "adopted" : "failed";
      } else if (at >= c.serverAt) {
        /* The row is our own last write, acknowledged or replayed. */
        c.serverAt = at;
      }
    }
    failed = false;
    c.okAt = Date.now();
    saveCfg();
  } catch {
    if (cfg === c) {
      failed = true;
      armRetry();
    }
    inflight = false;
    emit();
    return "failed";
  }
  inflight = false;
  emit();
  if (c.editedAt > c.serverAt && !held) {
    const pushed = await push();
    return outcome === "adopted" ? outcome : pushed;
  }
  return outcome;
}

/* ------------------------------ store contract --------------------------- */

/** Called by the store on every change of the persisted blob. `isEdit` is
 *  false only for the boot render; an adoption echoes back here too, and is
 *  recognised by reference so it never stamps itself as a new edit. */
export function trackData(data: PersistedData, isEdit: boolean): void {
  latest = data;
  if (data === adopted) {
    adopted = null;
    return;
  }
  if (!cfg || !isEdit) return;
  cfg.editedAt = stamp(cfg.editedAt);
  saveCfg();
  emit();
  schedulePush();
}

/** The store marks the blob it is about to adopt so trackData can skip it. */
export function markAdopted(data: PersistedData): void {
  adopted = data;
}

/** Tab going to (or coming from) the background: don't sit on the debounce. */
export function flush(): void {
  if (!cfg || cfg.editedAt <= cfg.serverAt) return;
  if (pushTimer !== null) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  void push(true);
}

let lastWake = 0;
/** Tab became visible again — the other device may have moved on. */
export function wake(): void {
  if (!cfg || inflight) return;
  const now = Date.now();
  if (now - Math.max(cfg.okAt, lastWake) < WAKE_MIN_MS) return;
  lastWake = now;
  void syncNow();
}

export function start(cb: OnRemote): void {
  stop();
  onRemote = cb;
  onlineListener = () => void syncNow();
  window.addEventListener("online", onlineListener);
  if (cfg) void syncNow();
}

export function stop(): void {
  if (onlineListener) {
    window.removeEventListener("online", onlineListener);
    onlineListener = null;
  }
  onRemote = null;
  clearTimers();
}

/* --------------------------------- the UI -------------------------------- */

/** Start syncing under a brand-new code, seeding the cloud with this device. */
export function enable(): string {
  if (cfg) return cfg.code;
  cfg = { code: newCode(), editedAt: stamp(0), serverAt: 0, okAt: 0 };
  failed = false;
  held = false;
  saveCfg();
  emit();
  void push();
  return cfg.code;
}

/** Connect this device to an existing code. The cloud copy wins; a device
 *  with progress worth keeping should export first (the panel says so). */
export async function join(code: string): Promise<SyncOutcome | "invalid"> {
  const trimmed = code.trim();
  if (!CODE_RE.test(trimmed)) return "invalid";
  clearTimers();
  cfg = { code: trimmed, editedAt: 0, serverAt: 0, okAt: 0, joining: true };
  failed = false;
  held = false;
  saveCfg();
  emit();
  return syncNow(true);
}

/** Stop syncing on this device. Local progress and the cloud copy both stay. */
export function disable(): void {
  clearTimers();
  cfg = null;
  failed = false;
  held = false;
  saveCfg();
  emit();
}
