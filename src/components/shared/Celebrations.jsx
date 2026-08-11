import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../../state/AppState.jsx";
import Toaster from "./Toaster.jsx";
import Confetti, { prefersReducedMotion } from "./Confetti.jsx";
import "./shared.css";

/* Drains the store's celebration queue into two short-lived local lists.
   Each item carries a monotonic id, so a replayed effect can't double-toast. */

export default function Celebrations() {
  const { state, actions } = useApp();
  const [toasts, setToasts] = useState([]);
  const [bursts, setBursts] = useState([]);
  const seen = useRef(0);

  useEffect(() => {
    if (!state.fx.length) return;

    const fresh = state.fx.filter((f) => f.id > seen.current);
    if (fresh.length) {
      seen.current = fresh[fresh.length - 1].id;
      const t = fresh.filter((f) => f.kind === "toast");
      const c = prefersReducedMotion() ? [] : fresh.filter((f) => f.kind === "confetti");
      if (t.length) setToasts((prev) => [...prev, ...t]);
      if (c.length) setBursts((prev) => [...prev, ...c]);
    }
    actions.consumeFx();
  }, [state.fx, actions]);

  const dropToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  const dropBurst = useCallback((id) => setBursts((p) => p.filter((b) => b.id !== id)), []);

  return (
    <>
      <Confetti bursts={bursts} onDone={dropBurst} />
      <Toaster toasts={toasts} onExpire={dropToast} />
    </>
  );
}
