import { useTrack } from "../../hooks/useTrack";
import { useApp } from "../../state/AppState";
import type { Day } from "../../types";
import MockTimer from "./MockTimer";
import ProblemRow from "./ProblemRow";
import RitualRow from "./RitualRow";
import "./DayBody.css";

/* Always mounted: CSS hides it unless its station is open. */
export default function DayBody({ day }: { day: Day }) {
  const { actions } = useApp();
  const { progress } = useTrack();

  return (
    <div className="daybody">
      <p className="daynote">{day.note}</p>
      {day.ritual && (
        <RitualRow
          ritual={day.ritual}
          color={day.color}
          done={!!progress.rituals[day.id]}
          onToggle={() => actions.toggleRitual(day.id)}
        />
      )}
      <ul className="plist">
        {day.probs.map((p) => (
          <ProblemRow
            key={p.id}
            prob={p}
            done={!!progress.done[p.id]}
            passed={!!progress.accepted[p.id]}
            onToggle={() => actions.toggleProb(p.id)}
            onOpenEditor={() => actions.openWork(p.id)}
          />
        ))}
      </ul>
      {day.mock && <MockTimer />}
    </div>
  );
}
