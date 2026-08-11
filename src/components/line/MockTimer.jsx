import { useTimer } from "../../state/TimerProvider.jsx";
import { fmtT } from "../../lib/engine.js";

/* 25:00, no pauses, talk out loud. Goes red under five minutes and calls
   pencils down at zero. Keeps running if you leave the tab. */

export default function MockTimer() {
  const timer = useTimer();

  return (
    <div className={"timer" + (timer.low ? " low" : "")}>
      <b role="timer" aria-live="off">
        {fmtT(timer.left)}
      </b>
      <button className="tbtn" onClick={timer.toggle}>
        {timer.label}
      </button>
      <button className="tbtn" onClick={timer.reset}>
        Reset
      </button>
      <span className="xpv" style={{ marginLeft: "auto" }}>
        the mock clock
      </span>
    </div>
  );
}
