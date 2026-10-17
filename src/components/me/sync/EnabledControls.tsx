import type { Ref } from "react";
import type { SyncStatus } from "../../../lib/sync";
import ButtonRow from "../../ui/ButtonRow";
import PillButton from "../../ui/PillButton";
import CodeChip from "../CodeChip";
import SyncStatusCard from "./SyncStatusCard";

interface EnabledControlsProps {
  status: SyncStatus;
  pop: boolean;
  now: number;
  onSyncNow: () => Promise<void>;
  onLink: () => void;
  linkRef: Ref<HTMLButtonElement>;
  onDisable: () => void;
}

export default function EnabledControls({ status, pop, now, onSyncNow, onLink, linkRef, onDisable }: EnabledControlsProps) {
  return (
    <>
      <SyncStatusCard status={status} pop={pop} now={now} />
      <CodeChip code={status.code ?? ""} />
      <ButtonRow>
        <PillButton disabled={status.phase === "working"} onClick={() => void onSyncNow()}>
          Sync now
        </PillButton>
        <PillButton icon="qr-code" onClick={onLink} ref={linkRef}>
          Link a device
        </PillButton>
        <PillButton tone="danger" onClick={onDisable}>
          Turn off
        </PillButton>
      </ButtonRow>
    </>
  );
}
