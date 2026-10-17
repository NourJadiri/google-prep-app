import { useSyncExternalStore } from "react";
import * as sync from "../../../../lib/sync";
import type { SyncStatus } from "../../../../lib/sync";

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(sync.subscribe, sync.getStatus);
}
