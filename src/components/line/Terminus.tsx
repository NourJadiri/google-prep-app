import Station from "./Station";
import type { Track } from "../../types";

/* End of the line. The dot is the only four-colour object in the app — in
   the line's own four colours. */

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
