import { BADGES } from "../../data/meta";
import Icon, { type IconName } from "../shared/Icon";

/* Line icon per badge — the emoji `ic` field in meta is ported data, not UI. */
const GLYPH: Record<string, IconName> = {
  first: "zap", ritual5: "layers", metro100: "train", perfect: "target",
  bugs20: "bug", streak3: "flame", streak7: "calendar-check",
  half: "milestone", line: "flag", noogler: "graduation-cap",
  green: "circle-check", green25: "list-checks",
  aws1: "send", awsHalf: "milestone", awsLine: "flag", awsTop: "graduation-cap",
};

interface BadgeGridProps {
  /** The badges this line shows, in order. */
  ids: readonly string[];
  colors: readonly string[];
  /** Badge id -> the timestamp it was awarded; absent means still locked. */
  badges: Record<string, number>;
}

export default function BadgeGrid({ ids, colors, badges }: BadgeGridProps) {
  const shown = ids.map((id) => BADGES.find((b) => b.id === id)).filter((b) => !!b);
  return (
    <div className="badges">
      {shown.map((b, k) => (
        <div key={b.id} className={"badge" + (badges[b.id] ? "" : " locked")} title={b.d}>
          <span className="ic" style={{ color: colors[k % 4] }}>
            <Icon name={GLYPH[b.id] ?? "star"} size={18} />
          </span>
          <span>{b.n}</span>
        </div>
      ))}
    </div>
  );
}
