import { useApp } from "../../state/AppState";
import ProblemRow from "./ProblemRow";
import RitualRow from "./RitualRow";
import MockTimer from "./MockTimer";
import Icon from "../shared/Icon";
import { progressOf, trackOf } from "../../lib/engine";
import type { Day } from "../../types";

/* A day's card: eyebrow, title, hairline progress, then the collapsible body.
   The body stays mounted and is hidden by CSS, exactly as the reference did —
   collapsing a day should not throw away anything it was holding. */

interface DayCardProps {
  day: Day;
  /** How many of the day's problems are ticked. */
  doneN: number;
  open: boolean;
}

export default function DayCard({ day, doneN, open }: DayCardProps) {
  const { state, actions } = useApp();
  const T = trackOf(state.data);
  const t = progressOf(state.data);
  const pct = Math.round((doneN / day.probs.length) * 100);

  return (
    <div className="daycard">
      <button
        className="dayhead"
        onClick={() => actions.toggleDay(day.id)}
        aria-expanded={open}
      >
        <div>
          <div className="eyebrow">{T.unit + " " + day.d + " · " + day.stn}</div>
          <h2>{day.name}</h2>
        </div>
        <span className="chev">
          <Icon name="chevron-down" size={18} />
        </span>
      </button>

      <div className="dayprog">
        <i style={{ width: pct + "%" }} />
      </div>

      <div className="daybody">
        <p className="daynote">{day.note}</p>
        {day.ritual && <RitualRow day={day} ritual={day.ritual} done={!!t.rituals[day.id]} />}
        <ul className="plist">
          {day.probs.map((p) => (
            <ProblemRow key={p.id} prob={p} done={!!t.done[p.id]} passed={!!t.accepted[p.id]} />
          ))}
        </ul>
        {day.mock && <MockTimer />}
      </div>
    </div>
  );
}
