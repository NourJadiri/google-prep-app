export type SyncPhase = "off" | "synced" | "pending" | "working" | "error";

export interface SyncStatus {
  enabled: boolean;
  code: string | null;
  phase: SyncPhase;
  /** ms epoch of the last successful exchange, 0 if never. */
  syncedAt: number;
  /** Newest stamp the server acknowledged as this device's own write; tells the Get-mode watch its own push landing from another device's arrival. */
  serverAt: number;
}

export type SyncOutcome = "adopted" | "pushed" | "clean" | "failed";

/** A row and the stamp it carries, nothing under the code yet, or no usable answer. */
export type ProbeResult = { at: number } | "none" | "unreachable";
