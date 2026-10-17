import { useEffect, useRef, useState } from "react";
import { clearDraft, loadDraft, saveDraft } from "../../../lib/drafts";
import { useLatest } from "../../../hooks/useLatest";

const SAVE_DELAY_MS = 400;

/** The code in the editor, saved shortly after the last keystroke and on the way out. A draft identical to the starter is no draft at all. */
export function useDraft(pid: string, starter: string) {
  const [code, setCode] = useState(() => loadDraft(pid) ?? starter);
  const [docRev, setDocRev] = useState(0);
  const latest = useLatest(code);
  const saveTimer = useRef(0);

  const persist = (c: string) => (c === starter ? clearDraft(pid) : saveDraft(pid, c));

  const onChange = (c: string) => {
    setCode(c);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => persist(c), SAVE_DELAY_MS);
  };

  const save = () => persist(code);

  const reset = () => {
    if (code !== starter && !window.confirm("Reset to the starter code? Your draft for this problem is cleared.")) return;
    setCode(starter);
    clearDraft(pid);
    setDocRev((n) => n + 1);
  };

  useEffect(
    () => () => {
      window.clearTimeout(saveTimer.current);
      persist(latest.current);
    },
    /* Unmount only: the body is keyed by problem, so this is "leaving it". */
    []
  );

  return { code, docKey: pid + ":" + docRev, onChange, save, reset };
}
