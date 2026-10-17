import { useEffect } from "react";
import type { Dispatch } from "react";
import * as engine from "../../lib/engine";
import * as sync from "../../lib/sync";
import type { Action } from "../actions";

export function useCloudSync(dispatch: Dispatch<Action>) {
  useEffect(() => {
    // Sync's only path into the store. Vets the blob like Import does; false (a payload a
    // newer version wrote) parks sync instead of letting either side overwrite the other.
    sync.start((raw) => {
      if (!engine.isExport(raw)) return false;
      const data = engine.normalize(raw);
      sync.markAdopted(data);
      dispatch({ type: "SYNC_ADOPT", data });
      return true;
    });
    return () => sync.stop();
  }, [dispatch]);
}
