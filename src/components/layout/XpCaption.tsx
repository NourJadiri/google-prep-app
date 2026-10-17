import "./XpCaption.css";

interface XpCaptionProps {
  unit: string;
  day: number;
  station: string;
  next: string;
}

export default function XpCaption({ unit, day, station, next }: XpCaptionProps) {
  return (
    <div className="xp-sub">
      <span className="xp-day">
        {unit + " " + day}
        <i className="xp-dot" aria-hidden="true" />
        <span className="xp-stn">{station}</span>
      </span>
      <span>{next}</span>
    </div>
  );
}
