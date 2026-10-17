import { rankProgress } from "../../lib/engine";
import { useTrack } from "../../hooks/useTrack";
import HeaderStats from "./HeaderStats";
import RankBadge from "./RankBadge";
import XpBar from "./XpBar";
import XpCaption from "./XpCaption";
import "./Header.css";

export default function Header() {
  const { data, track, progress, focus } = useTrack();
  const rank = rankProgress(track.ranks, progress.xp);

  return (
    <header className="hdr">
      <div className="hdr-row">
        <RankBadge name={rank.name} color={track.rankCol[rank.idx]} />
        <HeaderStats streak={data.streak.cur} xp={progress.xp} />
      </div>
      <XpBar pct={rank.pct} />
      <XpCaption unit={track.unit} day={focus.d} station={focus.stn} next={rank.nextLabel} />
    </header>
  );
}
