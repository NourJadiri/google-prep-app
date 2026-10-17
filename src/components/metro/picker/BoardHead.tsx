import { DECKS } from "../../../data/questions";
import "./BoardHead.css";

export default function BoardHead() {
  return (
    <div className="dboard-head">
      <span className="dboard-title">Departures — pick a line</span>
      <span className="dboard-live">
        <i aria-hidden="true" />
        {DECKS.length + " lines"}
      </span>
    </div>
  );
}
