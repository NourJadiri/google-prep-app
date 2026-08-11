import { BADGES } from "../../data/meta.js";

export default function BadgeGrid({ badges }) {
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
