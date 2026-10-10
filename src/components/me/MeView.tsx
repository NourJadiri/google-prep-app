import { useApp } from "../../state/AppState";
import { progressOf, trackOf } from "../../lib/engine";
import StatsGrid from "./StatsGrid";
import RankLadder from "./RankLadder";
import BadgeGrid from "./BadgeGrid";
import DataPanel from "./DataPanel";
import SyncPanel from "./SyncPanel";
import "./me.css";

export default function MeView() {
  const { state } = useApp();
  const { data } = state;
  const T = trackOf(data);

  return (
    <section className="view on">
      <div className="hero">
        <h1>
          Your <b>line</b>
        </h1>
        <p>{"The numbers, the ranks, the hardware — " + T.name + "."}</p>
      </div>

      {/* Mount point kept from the reference so the DOM matches element for
          element — see the note in MetroView. */}
      <div id="meArea">
        <StatsGrid data={data} />

        <div className="sectionlabel">Rank ladder</div>
        <RankLadder ranks={T.ranks} colors={T.rankCol} xp={progressOf(data).xp} />

        <div className="sectionlabel">Hardware</div>
        <BadgeGrid ids={T.badges} colors={T.rankCol} badges={data.badges} />

        <div className="sectionlabel">Data</div>
        <DataPanel />
      </div>

      {/* Outside #meArea on purpose: the parity harness diffs that subtree
          against the reference, and sync is new behaviour, not ported. */}
      <div className="sectionlabel">Sync</div>
      <SyncPanel />
    </section>
  );
}
