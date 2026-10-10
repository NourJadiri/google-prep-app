import { useApp } from "../../state/AppState";
import { focusDay, progressOf, stationsCleared, trackOf } from "../../lib/engine";
import Station from "./Station";
import DayCard from "./DayCard";
import Terminus from "./Terminus";
import Icon from "../shared/Icon";
import "./line.css";

export default function TransitLine() {
  const { state } = useApp();
  const { data } = state;
  const T = trackOf(data);
  const t = progressOf(data);
  const focus = focusDay(data);

  return (
    <div className="linewrap">
      {T.plan.map((day) => {
        const doneN = day.probs.filter((p) => t.done[p.id]).length;
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
            mark={isDone ? <Icon name="check" size={12} strokeWidth={3.5} /> : null}
          >
            <DayCard day={day} doneN={doneN} open={isOpen} />
          </Station>
        );
      })}
      <Terminus track={T} cleared={stationsCleared(data)} />
    </div>
  );
}
