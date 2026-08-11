import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { MOCK_SECONDS } from "../lib/engine.js";
import { useApp } from "./AppState.jsx";

/* The Day-7 mock clock lives above the views so it keeps counting while you
 * collapse the day or wander off to the Metro tab — the reference got that for
 * free from a module-level interval. Its own context keeps the once-a-second
 * tick from re-rendering the entire line.
 */

const TimerCtx = createContext(null);

export function TimerProvider({ children }) {
  const { actions } = useApp();
  const [left, setLeft] = useState(MOCK_SECONDS);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running || left > 0) return;
    setRunning(false);
    actions.celebrate(
      { kind: "toast", msg: "⏰ Pencils down.", gold: true },
      { kind: "confetti", n: 40 }
    );
  }, [running, left, actions]);

  const value = useMemo(
    () => ({
      left,
      running,
      low: left <= 300,
      label: running ? "Pause" : left === MOCK_SECONDS ? "Start" : left === 0 ? "Done" : "Resume",
      toggle: () => setRunning((r) => (r ? false : left > 0)),
      reset: () => {
        setRunning(false);
        setLeft(MOCK_SECONDS);
      },
    }),
    [left, running]
  );

  return <TimerCtx.Provider value={value}>{children}</TimerCtx.Provider>;
}

export function useTimer() {
  const ctx = useContext(TimerCtx);
  if (!ctx) throw new Error("useTimer must be used inside <TimerProvider>");
  return ctx;
}
