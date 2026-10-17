import type { PersistedData } from "../../types";
import { loadConfig, saveConfig } from "./config";
import type { SyncConfig } from "./config";

/** Handed the raw cloud blob; returns true only if it vetted and adopted it. */
export type OnRemote = (raw: unknown) => boolean;

interface SyncState {
  cfg: SyncConfig | null;
  latest: PersistedData | null;
  /** The object an adoption handed the store, matched by reference so its echo never counts as a local edit. */
  adopted: PersistedData | null;
  onRemote: OnRemote | null;
  inflight: boolean;
  failed: boolean;
  /** The cloud copy exists but didn't vet (a future schema version): neither side overwrites the other until the reader disconnects or adopts. */
  held: boolean;
}

export const state: SyncState = {
  cfg: loadConfig(),
  latest: null,
  adopted: null,
  onRemote: null,
  inflight: false,
  failed: false,
  held: false,
};

export const persist = (): void => saveConfig(state.cfg);
