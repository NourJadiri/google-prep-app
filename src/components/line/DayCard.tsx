import { useTrack } from "../../hooks/useTrack";
import { useApp } from "../../state/AppState";
import type { Day } from "../../types";
import DayBody from "./DayBody";
import DayHead from "./DayHead";
import DayProgress from "./DayProgress";
import "./DayCard.css";

interface DayCardProps {
  day: Day;
  /** How many of the day's problems are ticked. */
  doneN: number;
  open: boolean;
}

export default function DayCard({ day, doneN, open }: DayCardProps) {
  const { actions } = useApp();
  const { track } = useTrack();

  return (
    <div className="daycard">
      <DayHead
        eyebrow={`${track.unit} ${day.d} · ${day.stn}`}
        title={day.name}
        open={open}
        onToggle={() => actions.toggleDay(day.id)}
      />
      <DayProgress pct={Math.round((doneN / day.probs.length) * 100)} />
      <DayBody day={day} />
    </div>
  );
}
