import type { RunView } from "../lib/runPlan";
import Spinner from "../../ui/Spinner";
import "./ResultsRunning.css";

export default function ResultsRunning({ run }: { run: RunView }) {
  const done = run.progress?.results.length ?? 0;
  const noun = run.mode === "submit" ? "test" : "case";
  return (
    <div className="ws-running">
      <Spinner />
      <p>{run.progress ? `Running ${noun} ${Math.min(done + 1, run.plan.length)} of ${run.plan.length}…` : "Starting Python…"}</p>
    </div>
  );
}
