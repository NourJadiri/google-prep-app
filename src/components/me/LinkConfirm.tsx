import { useState } from "react";
import { useApp } from "../../state/AppState";
import * as sync from "../../lib/sync";
import type { SyncStatus } from "../../lib/sync";

/* The one surface that ever acts on a link.
 *
 * Every way a directive can arrive — a QR read by the camera app, a link out
 * of a message, this app's own scanner, the paste box in the send row — puts
 * it in the store and lands here, because every one of them can overwrite
 * something: this device's progress on the way in, the cloud's on the way out.
 * So the card states which of those it is, in this device's own numbers, and
 * nothing happens until the reader says yes.
 *
 * A card, not a modal: no focus trap, no scrim, no escape hatch to get wrong.
 * Ignoring it and scrolling on is a perfectly good answer.
 */

export default function LinkConfirm({
  status,
  hasProgress,
}: {
  status: SyncStatus;
  hasProgress: boolean;
}) {
  const { state, actions } = useApp();
  const [busy, setBusy] = useState(false);

  const link = state.link;
  if (!link) return null;
  const { code, dir } = link;

  const summary = `${state.data.xp} XP · ${Object.keys(state.data.done).length} problems`;
  const switching = status.enabled && status.code !== code;

  async function accept() {
    setBusy(true);
    /* join adopts the cloud copy, claim seeds it from here — the two halves of
       the same handshake, one per direction. */
    const out = dir === "recv" ? await sync.join(code) : await sync.claim(code);
    setBusy(false);
    if (out === "invalid") {
      /* Unreachable from a parsed link — link.ts enforces the server's own rule
         — but the card stays up rather than quietly doing nothing. */
      actions.toast("That doesn't look like a sync code");
      return;
    }
    /* "adopted" already toasts from the store; the rest speak for themselves. */
    if (dir === "recv") {
      if (out === "pushed") actions.toast("Connected — this device seeded the cloud", true);
      else if (out === "clean") actions.toast("Connected", true);
      else if (out === "failed")
        actions.toast("Connected — cloud unreachable right now, will keep trying");
    } else {
      if (out === "pushed") actions.toast("Progress sent — devices linked", true);
      else if (out === "clean") actions.toast("Already in sync");
      /* claim leaves the dirty flag and the retry timer armed, so this is a
         delay, not a failure. */
      else if (out === "failed") actions.toast("Will send when the cloud is reachable");
    }
    actions.clearLink();
  }

  return (
    <div className="linkcard">
      <h3>
        {dir === "recv" ? "Adopt the progress under this code?" : "Send this device's progress?"}
      </h3>
      <p>
        <code>{code}</code>
      </p>
      <p>
        {dir === "recv"
          ? `This device connects to that code and takes the cloud copy. What's here now — ${summary} — is replaced, so export first if it's worth keeping.`
          : `This device's copy — ${summary} — goes up under that code, and the two devices stay linked from there.`}
      </p>
      {switching && <p>This device syncs under another code today; accepting moves it to this one.</p>}
      {dir === "send" && !hasProgress && (
        <p>
          Nothing here to send? If your progress lives in the copy you added to your home
          screen, open that one and scan from there — it keeps its own storage.
        </p>
      )}
      <div className="mrow">
        <button className="mbtn" disabled={busy} onClick={() => void accept()}>
          {dir === "recv" ? "Connect & adopt" : "Send & link"}
        </button>
        <button className="mbtn" disabled={busy} onClick={actions.clearLink}>
          Cancel
        </button>
      </div>
    </div>
  );
}
