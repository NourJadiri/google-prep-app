import { totalOf } from "../../data/tracks";
import { useTrack } from "../../hooks/useTrack";
import { problemsDone, stationsCleared } from "../../lib/engine";
import Hero from "../ui/Hero";
import LinePicker from "./LinePicker";
import TrackDots from "./TrackDots";
import "./LineHero.css";

export default function LineHero() {
  const { data, track } = useTrack();

  return (
    <Hero
      above={<TrackDots />}
      heading={
        <>
          {track.title[0]} <b>{track.title[1]}</b>
        </>
      }
      blurb={track.blurb}
    >
      <p className="linestats">
        {`${problemsDone(data)} / ${totalOf(track.id)} problems · ${stationsCleared(data)} / ${track.plan.length} stations cleared`}
      </p>
      <LinePicker />
    </Hero>
  );
}
