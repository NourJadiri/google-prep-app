import { useRef, useState } from "react";
import { useApp } from "../../../../state/AppState";
import { isExport, normalize } from "../../../../lib/engine";
import { useCopyToast } from "../../../../hooks/useCopyToast";

/** Export is the persisted state as JSON; import takes any export the app has written, v1 blobs from the original app included. */
export function useProgressTransfer() {
  const { state, actions } = useApp();
  const copy = useCopyToast();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const box = useRef<HTMLTextAreaElement>(null);

  function exportProgress() {
    const raw = JSON.stringify(state.data);
    setOpen(true);
    setValue(raw);
    requestAnimationFrame(() => {
      const el = box.current;
      if (el) {
        el.focus();
        el.select();
      }
    });
    copy(raw, "Copied to clipboard");
  }

  function importProgress() {
    if (!open || !value.trim()) {
      setOpen(true);
      requestAnimationFrame(() => box.current?.focus());
      actions.toast("Paste your export, then tap Import again");
      return;
    }
    try {
      /* normalize is the only thing that turns unknown into a PersistedData; the isExport check rejects valid JSON that isn't an export instead of normalising it to a blank. */
      const obj: unknown = JSON.parse(value);
      if (!isExport(obj)) throw new Error("not an export");
      actions.importData(normalize(obj));
    } catch {
      actions.toast("That didn't parse — paste a full export");
    }
  }

  function resetProgress() {
    if (!window.confirm("Wipe all progress, XP and badges — on both lines?")) return;
    actions.reset();
  }

  return { box, open, value, setValue, exportProgress, importProgress, resetProgress };
}
