import { useApp } from "../../state/AppState.jsx";
import { TOTAL } from "../../data/plan.js";
import { problemsDone, stationsCleared } from "../../lib/engine.js";
import TransitLine from "./TransitLine.jsx";

export default function LineView() {
  const { state } = useApp();
  const { data } = state;

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
          Onsite <b>Express</b>
        </h1>
        <p>Two rounds between you and the terminus. Seven stations, one line. Board anywhere.</p>
        <p style={{ fontFamily: "var(--mono)", fontSize: "12px", marginTop: "6px" }}>
          {problemsDone(data) +
            " / " +
            TOTAL +
            " problems · " +
            stationsCleared(data) +
            " / 7 stations cleared"}
        </p>
      </div>
      <TransitLine />
    </section>
  );
}
