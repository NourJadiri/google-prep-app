import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useApp } from "../../state/AppState";
import * as sync from "../../lib/sync";
import type { SyncStatus, SyncPhase } from "../../lib/sync";
import Icon, { type IconName } from "../shared/Icon";
import LinkConfirm from "./LinkConfirm";
import LinkSheet from "./LinkSheet";
import ScanOverlay from "./ScanOverlay";

/* Cross-device sync controls. All the actual syncing lives in lib/sync; this
   panel only renders its status and forwards taps. The one rule it owns is
   the confirm before Connect: joining a code adopts the cloud copy, which is
   the only sync action that can cost this device progress.

   The status used to be a sentence in the footnote grey every other aside in
   this app wears, which made "cloud unreachable" and "here's a tip" look like
   the same kind of thing. It is a card now: one drawn cloud, tinted by phase
   the way the rank ladder tints its dot, a title, and how long ago the last
   exchange actually landed.

   Below it, three buttons and no more. Everything linking used to put here —
   a mode toggle, a Show-the-QR, a second code chip, a paste row — went into
   the sheet, because a column of eight identical pills tells the reader
   nothing about which one they want. "Copy code" went too: the dashed chip
   above it already copies on tap and was saying the same thing twice.

   This panel owns the three full-screen surfaces and keeps them exclusive:
   the sheet, the scanner it can hand off to, and the consent card, which
   closes the sheet (and with it the sheet's watch) the moment a directive
   needs answering. */

/* How often the "3m ago" line is allowed to be wrong by. A minute's precision
   with a half-minute tick means it is never off by more than it can show. */
const TICK_MS = 30_000;

interface Look {
  glyph: IconName;
  /* A token name, so both themes come along for free. */
  tone: string;
  title: string;
  /** The one sentence the card can't say in three words. */
  note: string;
}

function look(s: SyncStatus): Look {
  switch (s.phase) {
    case "working":
      return {
        glyph: "cloud-upload",
        tone: "var(--blue)",
        title: "Syncing…",
        note: "",
      };
    case "pending":
      return {
        glyph: "cloud-upload",
        tone: "var(--blue)",
        title: "Changes queued",
        note: "They go up in a moment, or the next time there's a network.",
      };
    case "error":
      return {
        glyph: "cloud-off",
        tone: "var(--red)",
        title: "Cloud unreachable",
        note: "Progress is safe on this device and will sync when it can.",
      };
    default:
      return {
        glyph: "cloud-check",
        tone: "var(--green)",
        title: s.syncedAt ? "All changes synced" : "Sync is on",
        /* The chip sits directly under the card, so "above" is where the note
           is standing when it says it. */
        note: "Enter the code above on another device to link it.",
      };
  }
}

/** "just now", "3m ago", "2h ago" — and nothing at all if it has never
 *  happened, because "never" is a status, not a timestamp. */
function ago(at: number, now: number): string {
  if (!at) return "";
  const secs = Math.max(0, Math.round((now - at) / 1000));
  if (secs < 45) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

/** The one transition worth animating: something was in flight and now it
 *  isn't. Mount is not a transition, which is why the ref starts where the
 *  status already is. */
function useSettledPop(phase: SyncPhase): boolean {
  const prev = useRef(phase);
  const [pop, setPop] = useState(false);
  useEffect(() => {
    const was = prev.current;
    prev.current = phase;
    if (phase !== "synced" || (was !== "working" && was !== "pending")) return;
    setPop(true);
    const t = setTimeout(() => setPop(false), 800);
    return () => clearTimeout(t);
  }, [phase]);
  return pop;
}

export default function SyncPanel() {
  const { state, actions } = useApp();
  const status = useSyncExternalStore(sync.subscribe, sync.getStatus);
  const [entering, setEntering] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  /* Only here to re-render the relative time; the value is never read. */
  const [, setTick] = useState(0);
  const pop = useSettledPop(status.phase);

  const hasProgress =
    state.data.xp > 0 ||
    Object.keys(state.data.done).length > 0 ||
    Object.keys(state.data.rituals).length > 0 ||
    state.data.quiz.answered > 0;

  /* A consent card and a live square must never share the screen: the card is
     a decision being made, and the sheet's poll would be making another one
     behind it. Closing the sheet stops that watch, which is the point. */
  useEffect(() => {
    if (state.link) setSheet(false);
  }, [state.link]);

  /* "3m ago" goes stale on its own, and nothing in the store changes when it
     does. One timer while this tab is mounted is the whole cost. */
  useEffect(() => {
    if (!status.enabled) return;
    const t = setInterval(() => setTick((n) => n + 1), TICK_MS);
    return () => clearInterval(t);
  }, [status.enabled]);

  /* Stable, because the sheet's poll effect has it in its deps. */
  const closeSheet = useCallback(() => setSheet(false), []);
  const closeScan = useCallback(() => setScanning(false), []);
  /* The sheet and the camera are both the whole screen and both about the same
     handshake; two at once is a state the reader has to back out of. */
  const toScanner = useCallback(() => {
    setSheet(false);
    setScanning(true);
  }, []);
  const openSheet = useCallback(() => {
    setEntering(false);
    setScanning(false);
    setSheet(true);
  }, []);

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
    /* The same moment the consent card celebrates, reached by typing. */
    if (out !== "failed") actions.celebrate({ kind: "confetti", n: 12 });
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

  const l = look(status);
  const when = ago(status.syncedAt, Date.now());

  /* The head is the half that swaps wholesale when sync comes on. It is kept
     at one fixed position in the tree, and the sheet at another, for a reason
     that took a broken animation to find: a Get-mode link *enables* sync, so
     this component flips branch in the middle of the sheet's own success beat.
     Reconciling by index, React would tear the sheet down and stand a fresh
     one up — no "Linked" card, and a second watch started on the code that had
     just been joined. Same index, same component, one instance, and the flip
     is invisible to it. */
  const head = status.enabled ? (
    <>
      <div className={"synccard" + (pop ? " pop" : "")} style={{ color: l.tone }}>
        <span className="ic">
          <Icon name={l.glyph} size={20} />
        </span>
        <div className="synctext">
          <b>{l.title}</b>
          {when && <span>Last synced {when}</span>}
        </div>
      </div>
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
        <button className="mbtn ico" onClick={openSheet}>
          <Icon name="qr-code" size={14} />
          Link a device
        </button>
        <button className="mbtn danger" onClick={doDisable}>
          Turn off
        </button>
      </div>
    </>
  ) : (
    <>
      <div className="mrow">
        <button className="mbtn" onClick={doEnable}>
          Turn on sync
        </button>
        <button
          className="mbtn"
          onClick={() => {
            setEntering((v) => !v);
            setSheet(false);
          }}
        >
          I have a code
        </button>
        {/* Same action, same name as the one on the enabled panel. */}
        <button className="mbtn ico" onClick={openSheet}>
          <Icon name="qr-code" size={14} />
          Link a device
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
    </>
  );

  return (
    <>
      {scanning && <ScanOverlay onClose={closeScan} />}
      {state.link && <LinkConfirm status={status} hasProgress={hasProgress} />}
      {head}
      {sheet && (
        <LinkSheet
          status={status}
          hasProgress={hasProgress}
          onScan={toScanner}
          onDone={closeSheet}
        />
      )}
      {status.enabled ? (
        l.note && <p className="storenote">{l.note}</p>
      ) : (
        <p className="storenote">
          Sync mirrors progress through the app's own cloud store. Turn it on here, then
          enter the code on the next device — the cloud copy wins there, so export first
          if that device has progress worth keeping.
        </p>
      )}
    </>
  );
}
