import { useApp } from "../../state/AppState.jsx";
import ProblemRow from "./ProblemRow.jsx";
import RitualRow from "./RitualRow.jsx";
import MockTimer from "./MockTimer.jsx";

/* A day's card: eyebrow, title, hairline progress, then the collapsible body.
   The body stays mounted and is hidden by CSS, exactly as the reference did —
   collapsing a day should not throw away anything it was holding. */

export default function DayCard({ day, doneN, open }) {
  const { state, actions } = useApp();
  const pct = Math.round((doneN / day.probs.length) * 100);

  return (
    <div className="daycard">
      <button
        className="dayhead"
        onClick={() => actions.toggleDay(day.id)}
        aria-expanded={open}
      >
        <div>
          <div className="eyebrow">{"Day " + day.d + " · " + day.stn}</div>
          <h2>{day.name}</h2>
        </div>
        <span className="chev">▾</span>
      </button>

      <div className="dayprog">
        <i style={{ width: pct + "%" }} />
      </div>

      <div className="daybody">
        <p className="daynote">{day.note}</p>
        <RitualRow day={day} done={!!state.data.rituals[day.id]} />
        <ul className="plist">
          {day.probs.map((p) => (
            <ProblemRow key={p.id} prob={p} done={!!state.data.done[p.id]} />
          ))}
        </ul>
        {day.id === "d7" && <MockTimer />}
      </div>
    </div>
  );
}
