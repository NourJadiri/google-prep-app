import { isDirty } from "./config";
import { state } from "./state";
import type { SyncPhase, SyncStatus } from "./types";

const listeners = new Set<() => void>();

function phase(): SyncPhase {
  const { cfg, inflight, failed, held } = state;
  if (!cfg) return "off";
  if (inflight) return "working";
  if (failed || held) return "error";
  return isDirty(cfg) ? "pending" : "synced";
}

function build(): SyncStatus {
  const { cfg } = state;
  return {
    enabled: !!cfg,
    code: cfg ? cfg.code : null,
    phase: phase(),
    syncedAt: cfg ? cfg.okAt : 0,
    serverAt: cfg ? cfg.serverAt : 0,
  };
}

/* Rebuilt only by emit(): useSyncExternalStore needs getStatus() to return the same object between changes. */
let snapshot: SyncStatus = build();

export function emit(): void {
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
