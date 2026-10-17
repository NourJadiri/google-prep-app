import "./DayProgress.css";

export default function DayProgress({ pct }: { pct: number }) {
  return (
    <div className="dayprog">
      <i style={{ width: pct + "%" }} />
    </div>
  );
}
