/* Ten ticks, one per stop, colouring in behind you as the run goes. */

export default function StopsTrack({ ids, results }) {
  return (
    <div className="stops-track" aria-hidden="true">
      {ids.map((_, k) => (
        <i key={k} className={k < results.length ? (results[k] ? "ok" : "ko") : ""} />
      ))}
    </div>
  );
}
