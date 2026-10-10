import { useEffect, useState } from "react";
import { fmtT } from "../../lib/engine";
import Icon from "../shared/Icon";

/* Interviews are timed, so practice can be: a quiet clock that starts when
   the workspace opens. Tap to pause; the reset sits beside it. Session-only
   on purpose — it's a mirror, not a record. */

export default function Stopwatch() {
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  return (
    <div className={"wclock" + (running ? "" : " paused")}>
      <button
        className="wclock-time"
        onClick={() => setRunning((r) => !r)}
        aria-label={running ? "Pause the clock" : "Resume the clock"}
        title={running ? "Pause" : "Resume"}
      >
        <Icon name={running ? "timer" : "pause"} size={13} />
        {fmtT(Math.min(secs, 99 * 60 + 59))}
      </button>
      <button
        className="wclock-reset"
        onClick={() => {
          setSecs(0);
          setRunning(true);
        }}
        aria-label="Reset the clock"
        title="Reset"
      >
        <Icon name="rotate-ccw" size={12} />
      </button>
    </div>
  );
}
