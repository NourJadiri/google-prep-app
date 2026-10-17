import type { RunnerPhase } from "../../../runner/runner";
import "./RunnerBadge.css";

const LABELS: Record<RunnerPhase, string> = {
  cold: "Python idle",
  loading: "Loading Python…",
  ready: "Ready",
  busy: "Running",
  failed: "Python failed to load",
};

export default function RunnerBadge({ phase }: { phase: RunnerPhase }) {
  return (
    <span className={"ws-runner " + phase}>
      <i aria-hidden="true" />
      {LABELS[phase]}
    </span>
  );
}
