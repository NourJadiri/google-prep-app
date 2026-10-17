import { useCallback } from "react";
import { useApp } from "../state/AppState";

/** Copies `text` and toasts `message` at once: a denied clipboard is not an error, so the toast does not wait for the write. */
export function useCopyToast(): (text: string, message: string) => void {
  const { actions } = useApp();
  return useCallback(
    (text, message) => {
      try {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(text).catch(() => {});
        actions.toast(message);
      } catch {
        /* no clipboard here; whatever was copied is still on screen */
      }
    },
    [actions]
  );
}
