import { useApp } from "../../state/AppState";
import { PLAN, TOTAL } from "../../data/plan";
import { problemsDone, stationsCleared } from "../../lib/engine";
import TransitLine from "./TransitLine";

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
        <p>Two rounds between you and the terminus. Twenty-four stations, one line. Board anywhere.</p>
        <p className="linestats">
          {problemsDone(data) +
            " / " +
            TOTAL +
            " problems · " +
            stationsCleared(data) +
            " / " +
            PLAN.length +
            " stations cleared"}
        </p>
      </div>
      <TransitLine />
    </section>
  );
}
