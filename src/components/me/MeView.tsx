import { useApp } from "../../state/AppState";
import { progressOf, trackOf } from "../../lib/engine";
import Section from "../ui/Section";
import BadgeGrid from "./badges/BadgeGrid";
import DataPanel from "./data/DataPanel";
import RankLadder from "./ladder/RankLadder";
import MeHero from "./MeHero";
import StatsGrid from "./stats/StatsGrid";
import SyncPanel from "./sync/SyncPanel";

export default function MeView() {
  const { state } = useApp();
  const { data } = state;
  const T = trackOf(data);

  return (
    <section className="view on">
      <MeHero trackName={T.name} />

      {/* The reference app's mount point; scripts/parity diffs this subtree against it. */}
      <div id="meArea">
        <StatsGrid data={data} />
        <Section title="Rank ladder">
          <RankLadder ranks={T.ranks} colors={T.rankCol} xp={progressOf(data).xp} />
        </Section>
        <Section title="Hardware">
          <BadgeGrid ids={T.badges} colors={T.rankCol} badges={data.badges} />
        </Section>
        <Section title="Data">
          <DataPanel />
        </Section>
      </div>

      {/* Outside #meArea on purpose: sync is new behaviour, not ported from the reference. */}
      <Section title="Sync">
        <SyncPanel />
      </Section>
    </section>
  );
}
