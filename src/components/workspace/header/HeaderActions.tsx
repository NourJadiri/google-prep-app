import type { RefObject } from "react";
import { modKey } from "../../../lib/platform";
import AskButton from "../../assistant/AskButton";
import Icon from "../../shared/Icon";
import Button from "../../ui/Button";
import Stopwatch from "../Stopwatch";
import type { Clock } from "../hooks/useStopwatch";
import "./HeaderActions.css";

interface HeaderActionsProps {
  wide: boolean;
  clock: RefObject<Clock>;
  /** The assistant is open. */
  asking: boolean;
  onAsk: () => void;
  copied: boolean;
  onCopy: () => void;
  busy: boolean;
  onRun: () => void;
  onStop: () => void;
  onSubmit: () => void;
}

export default function HeaderActions({ wide, clock, asking, onAsk, copied, onCopy, busy, onRun, onStop, onSubmit }: HeaderActionsProps) {
  return (
    <div className="ws-actions">
      {wide && <Stopwatch clock={clock} />}
      <AskButton open={asking} wide={wide} onClick={onAsk} />
      <Button variant="ghost" tone={copied ? "ok" : undefined} onClick={onCopy} title="Problem, code and last result, ready to paste into Claude">
        <Icon name={copied ? "check" : "copy"} size={14} />
        {wide && (copied ? "Copied" : "Copy for Claude")}
      </Button>
      {busy ? (
        <Button onClick={onStop} title="Stop">
          <Icon name="square" size={13} />
          Stop
        </Button>
      ) : (
        <Button onClick={onRun} title={"Run the cases (" + modKey() + "+Enter)"}>
          <Icon name="play" size={13} />
          Run
        </Button>
      )}
      <Button variant="primary" onClick={onSubmit} disabled={busy} title={"Run every test (" + modKey() + "+Shift+Enter)"}>
        <Icon name="send" size={13} />
        Submit
      </Button>
    </div>
  );
}
