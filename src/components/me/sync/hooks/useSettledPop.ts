import { useEffect, useRef, useState } from "react";
import type { SyncPhase } from "../../../../lib/sync";

/** True for a beat after something in flight settles. Mount is not a transition, so the ref starts where the phase already is. */
export function useSettledPop(phase: SyncPhase): boolean {
  const prev = useRef(phase);
  const [pop, setPop] = useState(false);
  useEffect(() => {
    const was = prev.current;
    prev.current = phase;
    if (phase !== "synced" || (was !== "working" && was !== "pending")) return;
    setPop(true);
    const t = setTimeout(() => setPop(false), 800);
    return () => clearTimeout(t);
  }, [phase]);
  return pop;
}
