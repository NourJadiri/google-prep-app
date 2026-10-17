import { useEffect, useRef, useState } from "react";
import { hasMissed, markMissed } from "../../../lib/attempts";
import type { RunView } from "../lib/runPlan";
import { isMiss } from "../lib/verdict";

/** True once this problem is one-shot: never solved before it opened, and its first accepted submission had no failed run before it. */
export function useOneShot(pid: string, run: RunView | null, accepted: boolean): boolean {
  const solvedBefore = useRef(accepted);
  const counted = useRef<number | null>(null);
  const [oneShot, setOneShot] = useState(false);

  useEffect(() => {
    if (!run?.verdict || counted.current === run.id) return;
    counted.current = run.id;
    if (isMiss(run.verdict)) markMissed(pid);
    else if (run.mode === "submit" && run.verdict.tone === "ok" && !solvedBefore.current && !hasMissed(pid)) setOneShot(true);
  }, [pid, run]);

  return oneShot;
}
