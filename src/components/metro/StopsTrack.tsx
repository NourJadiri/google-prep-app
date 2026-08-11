/* Ten ticks, one per stop, colouring in behind you as the run goes. */

interface StopsTrackProps {
  ids: string[];
  /** One entry per answered stop; shorter than `ids` mid-run. */
  results: boolean[];
}

export default function StopsTrack({ ids, results }: StopsTrackProps) {
  return (
    <div className="stops-track" aria-hidden="true">
      {ids.map((_, k) => (
        <i key={k} className={k < results.length ? (results[k] ? "ok" : "ko") : ""} />
      ))}
    </div>
  );
}
