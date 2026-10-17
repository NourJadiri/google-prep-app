import type { Ref } from "react";
import ButtonRow from "../../ui/ButtonRow";
import PillButton from "../../ui/PillButton";
import JoinRow from "./JoinRow";
import type { JoinForm } from "./hooks/useJoinForm";

interface DisabledControlsProps {
  join: JoinForm;
  onEnable: () => void;
  onToggleJoin: () => void;
  onLink: () => void;
  linkRef: Ref<HTMLButtonElement>;
}

export default function DisabledControls({ join, onEnable, onToggleJoin, onLink, linkRef }: DisabledControlsProps) {
  return (
    <>
      <ButtonRow>
        <PillButton onClick={onEnable}>Turn on sync</PillButton>
        <PillButton onClick={onToggleJoin}>I have a code</PillButton>
        <PillButton icon="qr-code" onClick={onLink} ref={linkRef}>
          Link a device
        </PillButton>
      </ButtonRow>
      {join.entering && (
        <JoinRow code={join.code} onChange={join.setCode} onConnect={join.connect} />
      )}
    </>
  );
}
