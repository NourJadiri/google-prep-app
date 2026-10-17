import { isSyncCode, mintCode } from "../syncCode";
import { freshConfig, stamp } from "./config";
import type { SyncConfig } from "./config";
import { clearTimers, push, syncNow } from "./engine";
import { persist, state } from "./state";
import { emit } from "./status";
import type { SyncOutcome } from "./types";

function replaceConfig(next: SyncConfig | null): void {
  state.cfg = next;
  state.failed = false;
  state.held = false;
  persist();
  emit();
}

/** Start syncing under a brand-new code, seeding the cloud with this device. */
export function enable(): string {
  if (state.cfg) return state.cfg.code;
  const cfg = freshConfig(mintCode(), stamp(0));
  replaceConfig(cfg);
  void push();
  return cfg.code;
}

/** Connect to an existing code. The cloud copy wins; a device with progress worth keeping should export first. */
export async function join(code: string): Promise<SyncOutcome | "invalid"> {
  const trimmed = code.trim();
  if (!isSyncCode(trimmed)) return "invalid";
  clearTimers();
  replaceConfig({ ...freshConfig(trimmed), joining: true });
  return syncNow(true);
}

/** The mirror of join(): take on a code the other device minted and seed the cloud from this device's blob, which the usual last-write-wins rule still judges. */
export async function claim(code: string): Promise<SyncOutcome | "invalid"> {
  const trimmed = code.trim();
  if (!isSyncCode(trimmed)) return "invalid";
  /* Someone re-scanned their own QR: reconcile, because fresh stamps here would replay this device over what the other one has written since. */
  if (state.cfg && state.cfg.code === trimmed) return syncNow();
  clearTimers();
  replaceConfig(freshConfig(trimmed, stamp(0)));
  /* A push that can't get out leaves editedAt > serverAt saved, which the retry timer and the next boot both act on. */
  return push();
}

/** Stop syncing on this device. Local progress and the cloud copy both stay. */
export function disable(): void {
  clearTimers();
  replaceConfig(null);
}
