import ButtonRow from "../../ui/ButtonRow";
import PillButton from "../../ui/PillButton";
import JoinRow from "./JoinRow";
import type { JoinForm } from "./hooks/useJoinForm";

interface DisabledControlsProps {
  join: JoinForm;
  onEnable: () => void;
  onToggleJoin: () => void;
  onLink: () => void;
}

export default function DisabledControls({ join, onEnable, onToggleJoin, onLink }: DisabledControlsProps) {
  return (
    <>
      <ButtonRow>
        <PillButton onClick={onEnable}>Turn on sync</PillButton>
        <PillButton onClick={onToggleJoin}>I have a code</PillButton>
        <PillButton icon="qr-code" onClick={onLink}>
          Link a device
        </PillButton>
      </ButtonRow>
      {join.entering && (
        <JoinRow code={join.code} busy={join.busy} onChange={join.setCode} onConnect={join.connect} />
      )}
    </>
  );
}
