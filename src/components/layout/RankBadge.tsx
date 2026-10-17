import "./RankBadge.css";

interface RankBadgeProps {
  name: string;
  color?: string;
}

export default function RankBadge({ name, color }: RankBadgeProps) {
  return (
    <div className="rank">
      <span className="rank-dot" style={{ background: color }} />
      <span className="rank-name">{name}</span>
    </div>
  );
}
