import { useRef } from "react";
import { useApp } from "../../../state/AppState";
import { hasAnyProgress } from "../../../lib/engine";
import LinkConfirm from "../link/LinkConfirm";
import LinkSheet from "../link/LinkSheet";
import ScanOverlay from "../scan/ScanOverlay";
import DisabledControls from "./DisabledControls";
import EnabledControls from "./EnabledControls";
import SyncNote from "./SyncNote";
import { useJoinForm } from "./hooks/useJoinForm";
import { useLinkFlow } from "./hooks/useLinkFlow";
import { useNow } from "./hooks/useNow";
import { useSettledPop } from "./hooks/useSettledPop";
import { useSyncActions } from "./hooks/useSyncActions";
import { useSyncStatus } from "./hooks/useSyncStatus";

/* Half a minute, so "3m ago" is never off by more than the minute it can show. */
const CLOCK_TICK_MS = 30_000;

export default function SyncPanel() {
  const { state } = useApp();
  const status = useSyncStatus();
  const hasProgress = hasAnyProgress(state.data);
  const pop = useSettledPop(status.phase);
  const now = useNow(CLOCK_TICK_MS, status.enabled);
  const flow = useLinkFlow(state.link);
  const join = useJoinForm(hasProgress);
  const { enable, syncNow, disable } = useSyncActions();
  /* Whichever control set is showing, its Link a device button: a Get-mode link turns sync on behind the
     sheet, which replaces the button that opened it. */
  const linkBtn = useRef<HTMLButtonElement>(null);

  const openSheet = () => {
    join.close();
    flow.openSheet();
  };
  const toggleJoin = () => {
    join.toggle();
    flow.closeSheet();
  };

  /* The controls and the sheet each keep one fixed slot. A Get-mode link enables sync mid-sheet, so
     this flips branch during the sheet's own success beat; if the sheet's slot moved with it, React
     would remount it, dropping the Linked card and starting a second watch on the joined code. */
  return (
    <>
      {flow.scanning && <ScanOverlay onClose={flow.closeScan} />}
      {state.link && <LinkConfirm link={state.link} status={status} hasProgress={hasProgress} />}
      {status.enabled ? (
        <EnabledControls
          status={status}
          pop={pop}
          now={now}
          onSyncNow={syncNow}
          onLink={openSheet}
          linkRef={linkBtn}
          onDisable={disable}
        />
      ) : (
        <DisabledControls join={join} onEnable={enable} onToggleJoin={toggleJoin} onLink={openSheet} linkRef={linkBtn} />
      )}
      {flow.sheet && (
        <LinkSheet
          status={status}
          hasProgress={hasProgress}
          onScan={flow.toScanner}
          onDone={flow.closeSheet}
          returnFocus={linkBtn}
        />
      )}
      <SyncNote status={status} />
    </>
  );
}
