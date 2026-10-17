import { TRACKS, TRACK_IDS } from "../../data/tracks";
import { useTrack } from "../../hooks/useTrack";
import { stationsCleared } from "../../lib/engine";
import { scrollToTop } from "../../lib/scroll";
import { useApp } from "../../state/AppState";
import type { TrackId } from "../../types";
import LinePickOption from "./LinePickOption";
import "./LinePicker.css";

export default function LinePicker() {
  const { actions } = useApp();
  const { data, track } = useTrack();

  const pick = (id: TrackId) => {
    if (id === track.id) return;
    actions.setTrack(id);
    scrollToTop();
  };

  return (
    <div className="lines" role="radiogroup" aria-label="Choose a line">
      {TRACK_IDS.map((id) => (
        <LinePickOption
          key={id}
          line={TRACKS[id]}
          on={id === track.id}
          cleared={stationsCleared(data, id)}
          onPick={() => pick(id)}
        />
      ))}
    </div>
  );
}
