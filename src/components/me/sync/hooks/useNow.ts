import { useEffect, useState } from "react";

/** The current time, re-read every `everyMs` while `active`. Nothing in a store changes when "3m ago" goes stale, so a timer has to. */
export function useNow(everyMs: number, active: boolean): number {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setTick((n) => n + 1), everyMs);
    return () => clearInterval(t);
  }, [everyMs, active]);
  return Date.now();
}
