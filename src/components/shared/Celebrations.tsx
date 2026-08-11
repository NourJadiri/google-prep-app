import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../../state/AppState";
import Toaster from "./Toaster";
import Confetti, { prefersReducedMotion } from "./Confetti";
import type { StampedConfetti, StampedToast } from "../../types";
import "./shared.css";

/* Drains the store's celebration queue into two short-lived local lists.
   Each item carries a monotonic id, so a replayed effect can't double-toast.

   The queue is a discriminated union on `kind`, so the two filters below are
   what splits it — each list is narrowed to one variant, and a toast can no
   longer be handed to the confetti renderer. */

export default function Celebrations() {
  const { state, actions } = useApp();
  const [toasts, setToasts] = useState<StampedToast[]>([]);
  const [bursts, setBursts] = useState<StampedConfetti[]>([]);
  const seen = useRef(0);

  useEffect(() => {
    if (!state.fx.length) return;

    const fresh = state.fx.filter((f) => f.id > seen.current);
    if (fresh.length) {
      seen.current = fresh[fresh.length - 1]!.id;
      const t = fresh.filter((f) => f.kind === "toast");
      const c = prefersReducedMotion() ? [] : fresh.filter((f) => f.kind === "confetti");
      if (t.length) setToasts((prev) => [...prev, ...t]);
      if (c.length) setBursts((prev) => [...prev, ...c]);
    }
    actions.consumeFx();
  }, [state.fx, actions]);

  const dropToast = useCallback(
    (id: number) => setToasts((p) => p.filter((t) => t.id !== id)),
    []
  );
  const dropBurst = useCallback(
    (id: number) => setBursts((p) => p.filter((b) => b.id !== id)),
    []
  );

  return (
    <>
      <Confetti bursts={bursts} onDone={dropBurst} />
      <Toaster toasts={toasts} onExpire={dropToast} />
    </>
  );
}
