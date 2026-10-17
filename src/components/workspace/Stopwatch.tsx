import type { RefObject } from "react";
import { fmtT } from "../../lib/engine";
import Icon from "../shared/Icon";
import { useStopwatch, type Clock } from "./hooks/useStopwatch";
import "./Stopwatch.css";

const MAX_SECS = 99 * 60 + 59;

/* Session-only on purpose: a mirror, not a record. */
export default function Stopwatch({ clock }: { clock: RefObject<Clock> }) {
  const { secs, running, toggle, reset } = useStopwatch(clock);

  return (
    <div className={"wclock" + (running ? "" : " paused")}>
      <button
        className="wclock-time"
        onClick={toggle}
        aria-label={running ? "Pause the clock" : "Resume the clock"}
        title={running ? "Pause" : "Resume"}
      >
        <Icon name={running ? "timer" : "pause"} size={13} />
        {fmtT(Math.min(secs, MAX_SECS))}
      </button>
      <button className="wclock-reset" onClick={reset} aria-label="Reset the clock" title="Reset">
        <Icon name="rotate-ccw" size={12} />
      </button>
    </div>
  );
}
