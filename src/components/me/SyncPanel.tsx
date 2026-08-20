import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useApp } from "../../state/AppState";
import * as sync from "../../lib/sync";
import type { SyncStatus } from "../../lib/sync";
import LinkConfirm from "./LinkConfirm";
import QrLinkPanel from "./QrLinkPanel";

/* Cross-device sync controls. All the actual syncing lives in lib/sync; this
   panel only renders its status and forwards taps. The one rule it owns is
   the confirm before Connect: joining a code adopts the cloud copy, which is
   the only sync action that can cost this device progress.

   It also composes the two linking surfaces: the QR sub-panel, which is a
   proposal being made, and the consent card, which is one being answered. */

function statusLine(s: SyncStatus): string {
  switch (s.phase) {
    case "working":
      return "Syncing…";
    case "pending":
      return "Changes queued — they'll sync in a moment.";
    case "error":
      return "Cloud unreachable — progress is safe on this device and will sync when it can.";
    default:
      return s.syncedAt
        ? "All changes synced. Enter the code above on another device to link it."
        : "Sync is on.";
  }
}

export default function SyncPanel() {
  const { state, actions } = useApp();
  const status = useSyncExternalStore(sync.subscribe, sync.getStatus);
  const [entering, setEntering] = useState(false);
  const [qr, setQr] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const hasProgress =
    state.data.xp > 0 ||
    Object.keys(state.data.done).length > 0 ||
    Object.keys(state.data.rituals).length > 0 ||
    state.data.quiz.answered > 0;

  /* A consent card and a live QR must never share the screen: the card is a
     decision being made, and the sub-panel's poll would be making another one
     behind it. Closing the sub-panel takes the scanner down with it. */
  useEffect(() => {
    if (state.link) setQr(false);
  }, [state.link]);

  /* Stable, because the QR panel's poll effect has it in its deps. */
  const closeQr = useCallback(() => setQr(false), []);

  function doEnable() {
    sync.enable();
    actions.toast("Sync is on — enter this code on your other device", true);
  }

  async function doJoin() {
    const trimmed = code.trim();
    if (!trimmed) {
      actions.toast("Paste the code from your other device first");
      return;
    }
    if (
      hasProgress &&
      !window.confirm(
        "This device has progress. Connecting replaces it with the cloud copy — export first if you want to keep it. Continue?"
      )
    ) {
      return;
    }
    setBusy(true);
    const out = await sync.join(trimmed);
    setBusy(false);
    if (out === "invalid") {
      actions.toast("That doesn't look like a sync code");
      return;
    }
    setEntering(false);
    setCode("");
    /* "adopted" already toasts from the store; the rest speak for themselves. */
    if (out === "pushed") actions.toast("Connected — this device seeded the cloud", true);
    else if (out === "clean") actions.toast("Connected", true);
    else if (out === "failed")
      actions.toast("Connected — cloud unreachable right now, will keep trying");
  }

  async function doSyncNow() {
    const out = await sync.syncNow();
    if (out === "pushed") actions.toast("Pushed to the cloud", true);
    else if (out === "clean") actions.toast("Already in sync");
    else if (out === "failed") actions.toast("Can't reach the cloud — progress is safe here");
  }

  function doCopy() {
    if (!status.code) return;
    try {
      if (navigator.clipboard) {
        // Optimistic, same as Export; a denied clipboard is not an error.
        navigator.clipboard.writeText(status.code).catch(() => {});
        actions.toast("Code copied");
      }
    } catch {
      /* no clipboard here — the code is still on screen to copy by hand */
    }
  }

  function doDisable() {
    if (!window.confirm("Stop syncing on this device? Progress here and in the cloud both stay.")) {
      return;
    }
    sync.disable();
    actions.toast("Sync is off");
  }

  if (!status.enabled) {
    return (
      <>
        {state.link && <LinkConfirm status={status} hasProgress={hasProgress} />}
        <div className="mrow">
          <button className="mbtn" onClick={doEnable}>
            Turn on sync
          </button>
          <button
            className="mbtn"
            onClick={() => {
              setEntering((v) => !v);
              setQr(false);
            }}
          >
            I have a code
          </button>
          <button
            className="mbtn"
            onClick={() => {
              setQr((v) => !v);
              setEntering(false);
            }}
          >
            Link by QR
          </button>
        </div>
        {entering && (
          <div className="mrow">
            <input
              className="syncinput"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your sync code"
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              aria-label="Sync code"
            />
            <button className="mbtn" disabled={busy} onClick={() => void doJoin()}>
              Connect
            </button>
          </div>
        )}
        {qr && <QrLinkPanel status={status} hasProgress={hasProgress} onDone={closeQr} />}
        <p className="storenote">
          Sync mirrors progress through the app's own cloud store. Turn it on here, then
          enter the code on the next device — the cloud copy wins there, so export first
          if that device has progress worth keeping.
        </p>
      </>
    );
  }

  return (
    <>
      {state.link && <LinkConfirm status={status} hasProgress={hasProgress} />}
      <button className="synccode" onClick={doCopy} title="Tap to copy">
        {status.code}
      </button>
      <div className="mrow">
        <button
          className="mbtn"
          disabled={status.phase === "working"}
          onClick={() => void doSyncNow()}
        >
          Sync now
        </button>
        <button className="mbtn" onClick={doCopy}>
          Copy code
        </button>
        <button className="mbtn" onClick={() => setQr((v) => !v)}>
          Link a device
        </button>
        <button className="mbtn danger" onClick={doDisable}>
          Turn off
        </button>
      </div>
      {qr && <QrLinkPanel status={status} hasProgress={hasProgress} onDone={closeQr} />}
      <p className="storenote">{statusLine(status)}</p>
    </>
  );
}
