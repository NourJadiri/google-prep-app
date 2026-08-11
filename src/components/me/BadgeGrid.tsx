import { BADGES } from "../../data/meta";

/** Badge id -> the timestamp it was awarded; absent means still locked. */
export default function BadgeGrid({ badges }: { badges: Record<string, number> }) {
  return (
    <div className="badges">
      {BADGES.map((b) => (
        <div key={b.id} className={"badge" + (badges[b.id] ? "" : " locked")} title={b.d}>
          <span className="ic">{b.ic}</span>
          <span>{b.n}</span>
        </div>
      ))}
    </div>
  );
}
