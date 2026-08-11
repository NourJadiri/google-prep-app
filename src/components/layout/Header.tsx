import { useApp } from "../../state/AppState";
import { focusDay, rankProgress } from "../../lib/engine";
import { RANKCOL } from "../../data/meta";
import "./Header.css";

/* Always-on status bar: who you are, how hot the streak is, and how far the
   next rank still is. The XP bar runs through all four logo colours. */

export default function Header() {
  const { state } = useApp();
  const { data } = state;
  const rank = rankProgress(data.xp);
  const day = focusDay(data);

  return (
    <header className="hdr">
      <div className="hdr-row">
        <div className="rank">
          <span className="rank-dot" style={{ background: RANKCOL[rank.idx] }} />
          <span className="rank-name">{rank.name}</span>
        </div>
        <div className="hdr-stats">
          <span>
            🔥 <b>{data.streak.cur}</b>
          </span>
          <span>
            XP <b>{data.xp}</b>
          </span>
        </div>
      </div>
      <div className="xp-track">
        <div className="xp-fill" style={{ width: rank.pct + "%" }} />
      </div>
      <div className="xp-sub">
        <span>{"Day " + day.d + " · " + day.stn}</span>
        <span>{rank.nextLabel}</span>
      </div>
    </header>
  );
}
