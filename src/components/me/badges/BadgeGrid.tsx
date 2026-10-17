import { BADGES } from "../../../data/meta";
import BadgeTile from "./BadgeTile";
import "./BadgeGrid.css";

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
        <BadgeTile key={b.id} badge={b} color={colors[k % 4]} earned={!!badges[b.id]} />
      ))}
    </div>
  );
}
