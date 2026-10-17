import "./StopsTrack.css";

interface StopsTrackProps {
  ids: string[];
  /** One entry per answered stop; shorter than `ids` mid-run. */
  results: boolean[];
}

function tickClass(result: boolean | undefined) {
  if (result === undefined) return "";
  return result ? "ok" : "ko";
}

export default function StopsTrack({ ids, results }: StopsTrackProps) {
  return (
    <div className="stops-track" aria-hidden="true">
      {ids.map((_, k) => (
        <i key={k} className={tickClass(results[k])} />
      ))}
    </div>
  );
}
