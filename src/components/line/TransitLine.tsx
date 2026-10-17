import { useTrack } from "../../hooks/useTrack";
import { stationsCleared } from "../../lib/engine";
import { useApp } from "../../state/AppState";
import DayCard from "./DayCard";
import Station from "./Station";
import Terminus from "./Terminus";
import { dayStatus } from "./lib/dayStatus";
import "./TransitLine.css";

export default function TransitLine() {
  const { state } = useApp();
  const { data, track, progress, focus } = useTrack();

  return (
    <div className="linewrap">
      {track.plan.map((day) => {
        const status = dayStatus(day, progress.done, focus.id);
        const open = state.openDays.includes(day.id);

        return (
          <Station key={day.id} color={day.color} done={status.done} now={status.now} open={open}>
            <DayCard day={day} doneN={status.doneN} open={open} />
          </Station>
        );
      })}
      <Terminus track={track} cleared={stationsCleared(data)} />
    </div>
  );
}
