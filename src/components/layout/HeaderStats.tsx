import Icon from "../shared/Icon";
import "./HeaderStats.css";

interface HeaderStatsProps {
  streak: number;
  xp: number;
}

export default function HeaderStats({ streak, xp }: HeaderStatsProps) {
  return (
    <div className="hdr-stats">
      <span aria-label={"Streak " + streak}>
        <Icon name="flame" size={13} className="flame" />
        <b>{streak}</b>
      </span>
      <span>
        XP <b>{xp}</b>
      </span>
    </div>
  );
}
