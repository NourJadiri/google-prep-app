import { useEffect } from "react";
import { useLatest } from "../../../hooks/useLatest";
import { isMac } from "../../../lib/platform";
import { isInOpenAssistant } from "../../assistant/lib/isInOpenAssistant";
import type { RunMode } from "../lib/runPlan";

interface ShortcutsOptions {
  start: (mode: RunMode) => void;
  closeWork: () => void;
  showAssistant: () => void;
  hideAssistant: () => void;
}

/** Shortcuts that work wherever focus is: Mod+Enter runs, Mod+Shift+Enter submits, Mod+K toggles the assistant, Esc leaves. */
export function useWorkspaceShortcuts({ start, closeWork, showAssistant, hideAssistant }: ShortcutsOptions) {
  const startRef = useLatest(start);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      /* The editor and the assistant preventDefault the keys they have handled. */
      if (e.defaultPrevented) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "Enter") {
        e.preventDefault();
        startRef.current(e.shiftKey ? "submit" : "run");
      } else if (e.key.toLowerCase() === "k" && !e.shiftKey && !e.altKey && (isMac() ? e.metaKey : e.ctrlKey)) {
        /* Ctrl alone on a Mac stays the editor's: Ctrl-K deletes to the end of the line there. */
        e.preventDefault();
        if (isInOpenAssistant(e.target)) hideAssistant();
        else showAssistant();
      } else if (e.key === "Escape" && !(e.target instanceof HTMLElement && e.target.closest(".cm-editor, textarea"))) {
        closeWork();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeWork, showAssistant, hideAssistant]);
}
