import { BADGES, RANKCOL } from "../../data/meta";
import Icon, { type IconName } from "../shared/Icon";

/* Line icon per badge — the emoji `ic` field in meta is ported data, not UI. */
const GLYPH: Record<string, IconName> = {
  first: "zap", ritual5: "layers", metro100: "train", perfect: "target",
  bugs20: "bug", streak3: "flame", streak7: "calendar-check",
  half: "milestone", line: "flag", noogler: "graduation-cap",
};

/** Badge id -> the timestamp it was awarded; absent means still locked. */
export default function BadgeGrid({ badges }: { badges: Record<string, number> }) {
  return (
    <div className="badges">
      {BADGES.map((b, k) => (
        <div key={b.id} className={"badge" + (badges[b.id] ? "" : " locked")} title={b.d}>
          <span className="ic" style={{ color: RANKCOL[k % 4] }}>
            <Icon name={GLYPH[b.id] ?? "star"} size={18} />
          </span>
          <span>{b.n}</span>
        </div>
      ))}
    </div>
  );
}
