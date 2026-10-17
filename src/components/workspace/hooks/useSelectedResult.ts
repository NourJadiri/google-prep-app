import { useEffect, useState } from "react";
import type { RunView } from "../lib/runPlan";

/** The plan index of the case whose result is open. Each finished run opens on the case worth looking at. */
export function useSelectedResult(run: RunView | null): [selected: number, select: (i: number) => void] {
  const [selected, select] = useState(0);
  const runId = run?.id ?? 0;
  const focus = (run?.verdict && run.outcome?.results[run.verdict.focus]?.i) ?? 0;
  useEffect(() => select(focus), [runId, focus]);
  return [selected, select];
}
