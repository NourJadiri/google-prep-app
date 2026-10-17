export default function ResultStat({ value, label }: { value: string | number; label: string }) {
  return (
    <span>
      <b>{value}</b>
      {label}
    </span>
  );
}
