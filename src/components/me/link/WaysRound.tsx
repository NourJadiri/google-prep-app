import CodeInput from "../CodeInput";
import "./WaysRound.css";

interface WaysRoundProps {
  /** Send mode: the paste row is offered. */
  send: boolean;
  canScan: boolean;
  target: string;
  onTarget: (target: string) => void;
  onSend: () => void;
  onScan: () => void;
}

/** What you reach for when the square isn't working. */
export default function WaysRound({ send, canScan, target, onTarget, onSend, onScan }: WaysRoundProps) {
  return (
    <div className="sheetsub">
      {send && (
        <>
          <CodeInput
            value={target}
            onChange={(e) => onTarget(e.target.value)}
            placeholder="Or paste a code or link"
            aria-label="Code to send this device's progress to"
          />
          <button className="sublink" onClick={onSend}>
            Send to a code
          </button>
        </>
      )}
      {canScan && (
        <button className="sublink" onClick={onScan}>
          Scan a code instead
        </button>
      )}
    </div>
  );
}
