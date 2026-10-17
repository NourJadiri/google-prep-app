import "./XpBar.css";

/** How far along the current rank is, in percent. */
export default function XpBar({ pct }: { pct: number }) {
  return (
    <div className="xp-track">
      <div className="xp-fill" style={{ width: pct + "%" }} />
    </div>
  );
}
