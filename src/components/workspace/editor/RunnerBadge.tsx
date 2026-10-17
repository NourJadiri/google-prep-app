import type { RunnerPhase } from "../../../runner/runner";
import StatusDot from "../../ui/StatusDot";
import "./RunnerBadge.css";

const LABELS: Record<RunnerPhase, string> = {
  cold: "Python idle",
  loading: "Loading Python…",
  ready: "Ready",
  busy: "Running",
  failed: "Python failed to load",
};

const TONES = { cold: "idle", loading: "pulse", ready: "ok", busy: "pulse", failed: "bad" } as const;

export default function RunnerBadge({ phase }: { phase: RunnerPhase }) {
  return (
    <span className={"ws-runner " + phase}>
      <StatusDot tone={TONES[phase]} aria-hidden="true" />
      {LABELS[phase]}
    </span>
  );
}
