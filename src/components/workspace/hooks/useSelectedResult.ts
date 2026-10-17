import { useEffect, useState } from "react";
import type { RunView } from "../lib/runPlan";

/** Which result chip is open. Each finished run opens on the case worth looking at. */
export function useSelectedResult(run: RunView | null): [selected: number, select: (i: number) => void] {
  const [selected, select] = useState(0);
  const runId = run?.id ?? 0;
  const focus = run?.verdict?.focus ?? 0;
  useEffect(() => select(focus), [runId, focus]);
  return [selected, select];
}
