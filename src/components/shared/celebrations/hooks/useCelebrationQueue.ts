import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../../../../lib/motion";
import { useApp } from "../../../../state/AppState";
import type { StampedConfetti, StampedToast } from "../../../../types";

/** Drains the store's celebration queue into two short-lived lists, one per kind. */
export function useCelebrationQueue() {
  const { state, actions } = useApp();
  const [toasts, setToasts] = useState<StampedToast[]>([]);
  const [bursts, setBursts] = useState<StampedConfetti[]>([]);
  const seen = useRef(0);

  /* Ids are monotonic, so a replayed effect can't play an item twice. */
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

  const dropToast = useCallback((id: number) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  const dropBurst = useCallback((id: number) => setBursts((p) => p.filter((b) => b.id !== id)), []);

  return { toasts, bursts, dropToast, dropBurst };
}
