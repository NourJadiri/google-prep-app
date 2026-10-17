import { useEffect, useReducer, useRef, type RefObject } from "react";

/** Seconds banked by earlier stretches, and when the current one started (null while paused). */
export interface Clock {
  banked: number;
  since: number | null;
}

const elapsed = (c: Clock): number => c.banked + (c.since === null ? 0 : Math.floor((Date.now() - c.since) / 1000));

/** The workspace's clock, kept above the header so a layout swap that unmounts the stopwatch doesn't restart it. */
export function useClock(): RefObject<Clock> {
  const clock = useRef<Clock>(null);
  if (!clock.current) clock.current = { banked: 0, since: Date.now() };
  return clock as RefObject<Clock>;
}

export function useStopwatch(clock: RefObject<Clock>) {
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  const running = clock.current.since !== null;

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(redraw, 1000);
    return () => window.clearInterval(t);
  }, [running]);

  const toggle = () => {
    const c = clock.current;
    clock.current = c.since === null ? { banked: c.banked, since: Date.now() } : { banked: elapsed(c), since: null };
    redraw();
  };
  const reset = () => {
    clock.current = { banked: 0, since: Date.now() };
    redraw();
  };

  return { secs: elapsed(clock.current), running, toggle, reset };
}
