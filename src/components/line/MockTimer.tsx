import { useTimer } from "../../state/TimerProvider";
import { fmtT } from "../../lib/engine";
import Icon from "../shared/Icon";

/* 25:00, no pauses, talk out loud. Goes red under five minutes and calls
   pencils down at zero. Keeps running if you leave the tab. */

export default function MockTimer() {
  const timer = useTimer();
  const glyph = timer.label === "Pause" ? "pause" : timer.label === "Done" ? "check" : "play";

  return (
    <div className={"timer" + (timer.low ? " low" : "")}>
      <b role="timer" aria-live="off">
        {fmtT(timer.left)}
      </b>
      <button className="tbtn" onClick={timer.toggle}>
        <Icon name={glyph} size={12} strokeWidth={2.5} />
        {timer.label}
      </button>
      <button className="tbtn" onClick={timer.reset}>
        <Icon name="rotate-ccw" size={12} strokeWidth={2.5} />
        Reset
      </button>
      <span className="xpv" style={{ marginLeft: "auto" }}>
        the mock clock
      </span>
    </div>
  );
}
