import type { PersistedData } from "../types";

// Key names predate the YALC rename; changing any (here, drafts.ts, sync/config.ts) would strand saved runs.
const KEY = "onsite-express-v1";
const DEBOUNCE_MS = 350;

// localStorage when the browser allows it, memory when it doesn't (private windows, blocked embeds).
let mode: "mem" | "local" = "mem";
let memValue: unknown = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let pending: PersistedData | null = null;

function probe(): boolean {
  try {
    const t = "__oe_probe";
    localStorage.setItem(t, "1");
    localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

export function load(): unknown {
  if (!probe()) {
    mode = "mem";
    return memValue;
  }
  mode = "local";
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Corrupt payload: stay in local mode so the next save overwrites it rather than downgrading to memory.
    return null;
  }
}

function persist(state: PersistedData): void {
  if (mode === "local") {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return;
    } catch {
      // Quota or a mid-session permission change: fall through to memory.
    }
  }
  memValue = state;
}

export function save(state: PersistedData): void {
  pending = state;
  if (timer !== null) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    pending = null;
    persist(state);
  }, DEBOUNCE_MS);
}

// iOS discards backgrounded tabs without warning: don't lose the pending write.
export function flush(): void {
  if (timer === null) return;
  clearTimeout(timer);
  timer = null;
  const s = pending;
  pending = null;
  if (s) persist(s);
}

export function storeNote(): string {
  return mode === "local"
    ? "Progress saves in this browser (localStorage). Export to move it between devices."
    : "Storage isn't available here, so progress lives only in this session — export before closing.";
}
