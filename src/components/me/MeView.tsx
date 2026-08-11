import { useApp } from "../../state/AppState";
import StatsGrid from "./StatsGrid";
import RankLadder from "./RankLadder";
import BadgeGrid from "./BadgeGrid";
import DataPanel from "./DataPanel";
import "./me.css";

export default function MeView() {
  const { state } = useApp();
  const { data } = state;

  return (
    <section className="view on">
      <div className="hero">
        <h1>
          Your <b>line</b>
        </h1>
        <p>The numbers, the ranks, the hardware.</p>
      </div>

      {/* Mount point kept from the reference so the DOM matches element for
          element — see the note in MetroView. */}
      <div id="meArea">
        <StatsGrid data={data} />

        <div className="sectionlabel">Rank ladder</div>
        <RankLadder xp={data.xp} />

        <div className="sectionlabel">Hardware</div>
        <BadgeGrid badges={data.badges} />

        <div className="sectionlabel">Data</div>
        <DataPanel />
      </div>
    </section>
  );
}
