import { useEffect, type RefObject } from "react";

/** Focus goes to `initial` on open and back to whatever opened the dialog on close, or to `fallback` if that is gone;
 *  Escape calls `onClose`. Inert without `onClose`. */
export function useDialogBehavior(
  onClose: (() => void) | undefined,
  initial?: RefObject<HTMLElement | null>,
  fallback?: RefObject<HTMLElement | null>
) {
  const active = onClose !== undefined;

  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement;
    initial?.current?.focus();
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
      else fallback?.current?.focus();
    };
  }, [active, initial, fallback]);

  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
}
