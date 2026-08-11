import { useApp } from "../../state/AppState.jsx";
import { PLAN } from "../../data/plan.js";
import { focusDay, stationsCleared } from "../../lib/engine.js";
import Station from "./Station.jsx";
import DayCard from "./DayCard.jsx";
import Terminus from "./Terminus.jsx";
import "./line.css";

export default function TransitLine() {
  const { state } = useApp();
  const { data } = state;
  const focus = focusDay(data);

  return (
    <div className="linewrap">
      {PLAN.map((day) => {
        const doneN = day.probs.filter((p) => data.done[p.id]).length;
        const isDone = doneN === day.probs.length;
        const isNow = day.id === focus.id && !isDone;
        const isOpen = state.openDays.includes(day.id);

        return (
          <Station
            key={day.id}
            color={day.color}
            done={isDone}
            now={isNow}
            open={isOpen}
            mark={isDone ? "✓" : null}
          >
            <DayCard day={day} doneN={doneN} open={isOpen} />
          </Station>
        );
      })}
      <Terminus cleared={stationsCleared(data)} />
    </div>
  );
}
