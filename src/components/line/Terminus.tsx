import type { Track } from "../../types";
import Station from "./Station";
import "./Terminus.css";

export default function Terminus({ track, cleared }: { track: Track; cleared: number }) {
  return (
    <Station color="var(--line)" terminus>
      <div className="terminus-card">
        <h2>{track.terminus}</h2>
        <p>{track.terminusCopy(cleared)}</p>
      </div>
    </Station>
  );
}
