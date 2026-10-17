import { useEffect, useRef } from "react";

/** Moves focus into the dialog on open and back to whatever opened it on close: the row's editor button, for a keyboard user. */
export function useDialogFocus() {
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.current?.focus();
    return () => opener?.focus();
  }, []);
  return dialog;
}
