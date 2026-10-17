import type { PersistedData } from "../../types";
import { isDirty, stamp } from "./config";
import { cancelPush, clearTimers, push, schedulePush, syncNow } from "./engine";
import { persist, state } from "./state";
import type { OnRemote } from "./state";
import { emit } from "./status";

/* Don't re-pull on every tab flick; a phone habit is many of those a minute. */
const WAKE_MIN_MS = 30_000;

let lastWake = 0;
let onlineListener: (() => void) | null = null;

/** Called by the store on every change of the persisted blob; `isEdit` is false only for the boot render. */
export function trackData(data: PersistedData, isEdit: boolean): void {
  state.latest = data;
  if (data === state.adopted) {
    state.adopted = null;
    return;
  }
  const { cfg } = state;
  if (!cfg || !isEdit) return;
  cfg.editedAt = stamp(cfg.editedAt);
  persist();
  emit();
  schedulePush();
}

/** The store marks the blob it is about to adopt so trackData can skip it. */
export function markAdopted(data: PersistedData): void {
  state.adopted = data;
}

/** Tab going to (or coming from) the background: don't sit on the debounce. */
export function flush(): void {
  const { cfg } = state;
  if (!cfg || !isDirty(cfg)) return;
  cancelPush();
  void push(true);
}

/** Tab became visible again; the other device may have moved on. */
export function wake(): void {
  const { cfg } = state;
  if (!cfg || state.inflight) return;
  const now = Date.now();
  if (now - Math.max(cfg.okAt, lastWake) < WAKE_MIN_MS) return;
  lastWake = now;
  void syncNow();
}

export function start(cb: OnRemote): void {
  stop();
  state.onRemote = cb;
  onlineListener = () => void syncNow();
  window.addEventListener("online", onlineListener);
  if (state.cfg) void syncNow();
}

export function stop(): void {
  if (onlineListener) {
    window.removeEventListener("online", onlineListener);
    onlineListener = null;
  }
  state.onRemote = null;
  clearTimers();
}
