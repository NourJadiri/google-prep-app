import { useRef, useState } from "react";
import { useApp } from "../../state/AppState";
import { isExport, normalize } from "../../lib/engine";
import { storeNote } from "../../lib/storage";

/* Export is literally the persisted state. Imports take any export the app
   has written — the original single-file app's v1 blobs too, which upgrade
   on the way in (their progress lands on the Google line). */

export default function DataPanel() {
  const { state, actions } = useApp();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const box = useRef<HTMLTextAreaElement>(null);

  function doExport() {
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
    try {
      if (navigator.clipboard) {
        // Optimistic toast, same as the reference; a denied clipboard is not an error.
        navigator.clipboard.writeText(raw).catch(() => {});
        actions.toast("Copied to clipboard");
      }
    } catch {
      /* no clipboard here — the textarea is still selected to copy by hand */
    }
  }

  function doImport() {
    if (!open || !value.trim()) {
      setOpen(true);
      requestAnimationFrame(() => box.current?.focus());
      actions.toast("Paste your export, then tap Import again");
      return;
    }
    try {
      /* JSON.parse hands back `any`; normalize takes `unknown` and is the only
         thing that turns it into a PersistedData. The version check stays so
         valid JSON that isn't an export is rejected loudly instead of
         normalising to a blank. */
      const obj: unknown = JSON.parse(value);
      if (!isExport(obj)) throw new Error("not an export");
      actions.importData(normalize(obj));
    } catch {
      actions.toast("That didn't parse — paste a full export");
    }
  }

  function doReset() {
    if (!window.confirm("Wipe all progress, XP and badges — on both lines?")) return;
    actions.reset();
  }

  return (
    <>
      <div className="mrow">
        <button className="mbtn" onClick={doExport}>
          Export progress
        </button>
        <button className="mbtn" onClick={doImport}>
          Import
        </button>
        <button className="mbtn danger" onClick={doReset}>
          Reset
        </button>
      </div>
      <textarea
        ref={box}
        className={"io" + (open ? " on" : "")}
        spellCheck="false"
        placeholder="Paste an export here, then tap Import again."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Progress export and import"
      />
      <p className="storenote">{storeNote()}</p>
    </>
  );
}
