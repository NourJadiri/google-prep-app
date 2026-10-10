import { useApp } from "../../state/AppState";
import { TRACKS, TRACK_IDS, totalOf } from "../../data/tracks";
import { problemsDone, stationsCleared, trackOf } from "../../lib/engine";
import TransitLine from "./TransitLine";

/* The hero names the line you're riding, and the picker under it is the one
   place to change trains — a metro map's legend, two line bullets wide. */

export default function LineView() {
  const { state, actions } = useApp();
  const { data } = state;
  const T = trackOf(data);

  return (
    <section className="view on">
      <div className="hero">
        <div className="gdots">
          <i />
          <i />
          <i />
          <i />
        </div>
        <h1>
          {T.title[0]} <b>{T.title[1]}</b>
        </h1>
        <p>{T.blurb}</p>
        <p className="linestats">
          {problemsDone(data) +
            " / " +
            totalOf(T.id) +
            " problems · " +
            stationsCleared(data) +
            " / " +
            T.plan.length +
            " stations cleared"}
        </p>
        <div className="lines" role="radiogroup" aria-label="Choose a line">
          {TRACK_IDS.map((id) => {
            const L = TRACKS[id];
            const on = id === T.id;
            return (
              <button
                key={id}
                role="radio"
                aria-checked={on}
                className={"linepick" + (on ? " on" : "")}
                data-track={id}
                onClick={() => {
                  if (!on) {
                    actions.setTrack(id);
                    window.scrollTo(0, 0);
                  }
                }}
              >
                <span className="lbullet" aria-hidden="true">
                  {L.bullet}
                </span>
                <span className="lname">
                  <b>{L.name}</b>
                  <span>{L.company + " · " + stationsCleared(data, id) + "/" + L.plan.length}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <TransitLine />
    </section>
  );
}
