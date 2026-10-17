import { isDirty, stamp } from "./config";
import type { SyncConfig } from "./config";
import { getRow, putRow } from "./remote";
import type { PushReply, RemoteRow } from "./remote";
import { persist, state } from "./state";
import { emit } from "./status";
import { createTimer } from "./timer";
import type { SyncOutcome } from "./types";

const PUSH_DEBOUNCE_MS = 4_000;
const RETRY_MS = 30_000;

const pushTimer = createTimer();
const retryTimer = createTimer();

export function schedulePush(): void {
  if (!state.cfg) return;
  pushTimer.restart(() => void push(), PUSH_DEBOUNCE_MS);
}

export const cancelPush = (): void => pushTimer.stop();

export function clearTimers(): void {
  pushTimer.stop();
  retryTimer.stop();
}

function armRetry(): void {
  if (retryTimer.armed()) return;
  retryTimer.restart(() => void syncNow(), RETRY_MS);
}

function setWorking(working: boolean): void {
  state.inflight = working;
  emit();
}

function noteFailure(c: SyncConfig): void {
  if (state.cfg !== c) return;
  state.failed = true;
  armRetry();
}

/** True if the cloud copy was vetted and taken; false parks the sync. */
function adopt(raw: unknown, updatedAt: number): boolean {
  const { cfg, onRemote } = state;
  if (!cfg) return false;
  if (onRemote && onRemote(raw)) {
    cfg.editedAt = updatedAt;
    cfg.serverAt = updatedAt;
    delete cfg.joining;
    state.held = false;
    return true;
  }
  state.held = true;
  return false;
}

function applyPushReply(c: SyncConfig, sent: number, reply: PushReply): SyncOutcome {
  if (reply.applied) {
    c.serverAt = Math.max(c.serverAt, sent);
    delete c.joining;
    return "pushed";
  }
  /* Another device wrote a newer copy while we were away (or a newer app did): take it if we can read it. */
  return adopt(reply.data, reply.updatedAt ?? sent) ? "adopted" : "held";
}

export async function push(keepalive = false): Promise<SyncOutcome> {
  const c = state.cfg;
  if (!c || !state.latest || state.inflight) return "failed";
  if (state.held) return "held";
  if (!isDirty(c)) return "clean";
  const sent = c.editedAt;
  const body = JSON.stringify({ updatedAt: sent, data: state.latest });
  setWorking(true);
  try {
    const reply = await putRow(c.code, body, keepalive);
    if (state.cfg !== c) return "failed"; // disconnected mid-flight: drop the result
    state.failed = false;
    c.okAt = Date.now();
    const outcome = applyPushReply(c, sent, reply);
    persist();
    /* Edited again while the request was out? One more round. */
    if (isDirty(c) && !state.held) schedulePush();
    return outcome;
  } catch {
    noteFailure(c);
    return "failed";
  } finally {
    setWorking(false);
  }
}

/** JSON with every object's keys sorted, so two copies of one blob compare equal whatever order they were built in. */
const canonical = (x: unknown): string =>
  JSON.stringify(x, (_, v: unknown) =>
    v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : 1))) : v
  );

/* Our unacknowledged stamp on different content: another device stamped the same instant first. */
const tiedWithAnother = (c: SyncConfig, row: RemoteRow): boolean =>
  row.updatedAt === c.editedAt && row.updatedAt > c.serverAt && canonical(row.data) !== canonical(state.latest);

function reconcile(c: SyncConfig, row: RemoteRow, remoteWins: boolean): SyncOutcome {
  if (remoteWins || row.updatedAt > c.editedAt || tiedWithAnother(c, row)) {
    return adopt(row.data, row.updatedAt) ? "adopted" : "held";
  }
  /* The row is our own last write, acknowledged or replayed. */
  if (row.updatedAt >= c.serverAt) c.serverAt = row.updatedAt;
  return "clean";
}

async function pull(c: SyncConfig, remoteWins: boolean): Promise<SyncOutcome> {
  setWorking(true);
  try {
    const row = await getRow(c.code);
    if (state.cfg !== c) return "failed"; // disconnected mid-flight: drop the result
    let outcome: SyncOutcome = "clean";
    if (row === null) {
      /* Nothing in the cloud yet: this device's copy seeds it. */
      if (c.editedAt === 0) c.editedAt = stamp(c.editedAt);
      delete c.joining;
      state.held = false;
    } else {
      outcome = reconcile(c, row, remoteWins);
    }
    state.failed = false;
    c.okAt = Date.now();
    persist();
    return outcome;
  } catch {
    noteFailure(c);
    return "failed";
  } finally {
    setWorking(false);
  }
}

/** Pull, reconcile, and push whatever survives. Every trigger funnels through here: boot, retry, regained network, tab focus. */
export async function syncNow(preferRemote = false): Promise<SyncOutcome> {
  const c = state.cfg;
  if (!c || state.inflight) return "failed";
  const outcome = await pull(c, preferRemote || c.joining === true);
  if (outcome === "failed" || outcome === "held" || !isDirty(c)) return outcome;
  const pushed = await push();
  return outcome === "adopted" ? outcome : pushed;
}
