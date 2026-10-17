import ButtonRow from "../../ui/ButtonRow";
import PillButton from "../../ui/PillButton";
import CodeInput from "../CodeInput";

interface JoinRowProps {
  code: string;
  busy: boolean;
  onChange: (code: string) => void;
  onConnect: () => Promise<void>;
}

export default function JoinRow({ code, busy, onChange, onConnect }: JoinRowProps) {
  return (
    <ButtonRow>
      <CodeInput
        value={code}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your sync code"
        aria-label="Sync code"
      />
      <PillButton disabled={busy} onClick={() => void onConnect()}>
        Connect
      </PillButton>
    </ButtonRow>
  );
}
