import { useCallback } from "react";
import { useApp } from "../../../../state/AppState";
import * as sync from "../../../../lib/sync";
import { useOutcomeFx } from "../../hooks/useOutcomeFx";

export function useSyncActions() {
  const { actions } = useApp();
  const fx = useOutcomeFx();

  const enable = useCallback(() => {
    sync.enable();
    actions.toast("Sync is on — enter this code on your other device", true);
  }, [actions]);

  const syncNow = useCallback(async () => {
    fx.synced(await sync.syncNow());
  }, [fx]);

  const disable = useCallback(() => {
    if (!window.confirm("Stop syncing on this device? Progress here and in the cloud both stay.")) {
      return;
    }
    sync.disable();
    actions.toast("Sync is off");
  }, [actions]);

  return { enable, syncNow, disable };
}
