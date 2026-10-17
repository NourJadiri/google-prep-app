import { useEffect, useState } from "react";

export function useStopwatch() {
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  const toggle = () => setRunning((r) => !r);
  const reset = () => {
    setSecs(0);
    setRunning(true);
  };

  return { secs, running, toggle, reset };
}
