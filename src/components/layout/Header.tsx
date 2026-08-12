import { useApp } from "../../state/AppState";
import { focusDay, rankProgress } from "../../lib/engine";
import { RANKCOL } from "../../data/meta";
import Icon from "../shared/Icon";
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
          <span aria-label={"Streak " + data.streak.cur}>
            <Icon name="flame" size={13} className="flame" />
            <b>{data.streak.cur}</b>
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
        <span className="xp-day">
          {"Day " + day.d}
          <i className="xp-dot" aria-hidden="true" />
          <span className="xp-stn">{day.stn}</span>
        </span>
        <span>{rank.nextLabel}</span>
      </div>
    </header>
  );
}
