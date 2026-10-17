import { useEffect, useRef, type RefObject } from "react";

/* Focus comes in on every summon and goes back on close to wherever ⌘K was pressed. */
export function useWindowFocus(
  panel: RefObject<HTMLElement | null>,
  field: RefObject<HTMLElement | null>,
  open: boolean,
  summon: number
) {
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    /* The body is nowhere: it is where focus falls when the lock screen's field is swapped for the composer. */
    if (active instanceof HTMLElement && active !== document.body && !panel.current?.contains(active)) {
      returnTo.current = active;
    }
    field.current?.focus();
  }, [open, summon, field, panel]);

  /* Focus left inside a hidden window would swallow the next ⌘K, so it always leaves. */
  useEffect(() => {
    if (open) return;
    const back = returnTo.current;
    returnTo.current = null;
    const active = document.activeElement;
    if (active && active !== document.body && !panel.current?.contains(active)) return;
    if (back?.isConnected) back.focus();
    else if (active instanceof HTMLElement) active.blur();
  }, [open, panel]);
}
