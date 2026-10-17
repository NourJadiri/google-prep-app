import { useEffect, useRef } from "react";
import * as storage from "../../lib/storage";
import * as sync from "../../lib/sync";
import type { PersistedData } from "../../types";

export function useSaveData(data: PersistedData) {
  const firstRun = useRef(true);
  useEffect(() => {
    // The first run is the blob just loaded: nothing to write back, but sync must hear of it.
    if (firstRun.current) {
      firstRun.current = false;
      sync.trackData(data, false);
      return;
    }
    storage.save(data);
    sync.trackData(data, true);
  }, [data]);
}
