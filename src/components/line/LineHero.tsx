import { totalOf } from "../../data/tracks";
import { useTrack } from "../../hooks/useTrack";
import { problemsDone, stationsCleared } from "../../lib/engine";
import LinePicker from "./LinePicker";
import "./LineHero.css";

export default function LineHero() {
  const { data, track } = useTrack();

  return (
    <div className="hero">
      <div className="gdots">
        <i />
        <i />
        <i />
        <i />
      </div>
      <h1>
        {track.title[0]} <b>{track.title[1]}</b>
      </h1>
      <p>{track.blurb}</p>
      <p className="linestats">
        {`${problemsDone(data)} / ${totalOf(track.id)} problems · ${stationsCleared(data)} / ${track.plan.length} stations cleared`}
      </p>
      <LinePicker />
    </div>
  );
}
