import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../../state/AppState";
import * as sync from "../../lib/sync";
import type { SyncStatus } from "../../lib/sync";
import { linkUrl, parseLink } from "../../lib/link";
import Icon from "../shared/Icon";
import QrModal from "./QrModal";
import ScanOverlay, { scanSupported } from "./ScanOverlay";

/* Linking two devices with a square on the screen.
 *
 * The QR is a link to this app carrying a code and an instruction for whoever
 * scans it, so the two modes here are named for what *this* device wants —
 * "Get progress" puts up a code that says `do=send`, "Send progress" puts up
 * one that says `do=recv`. The verb is inverted on purpose: the reader thinks
 * about their own device, and the other device gets told what to do.
 *
 * Get mode is the only place in the app that waits on the cloud. There is
 * nothing to subscribe to — the store is one dumb row — so it peeks at the row
 * every few seconds while it is on screen and stops the moment the other
 * device writes. Nothing is enabled until that happens: a code nobody scans
 * leaves no row, no config and no trace.
 *
 * The square itself lives in QrModal, full screen. This panel still owns the
 * poll, deliberately: the modal is display, and the two lifetimes are not the
 * same one. Closing the square is not calling off the link.
 */

const POLL_MS = 2_500;
const WAITING = "Waiting for the other device";
const UNREACHABLE = "Cloud unreachable — progress here is safe; still watching for the other device.";
/* How long the modal holds its "Linked" card before collapsing. Long enough to
   register as an answer, short enough that nobody reaches for Close. */
const WIN_MS = 1_200;

type Mode = "get" | "send";

/* Three dots the reader can watch, so a poll that takes twenty seconds looks
   like waiting rather than like nothing happening. The characters are real, so
   the line still reads "Waiting for the other device..." to anything that only
   sees text — and stops moving under prefers-reduced-motion. */
function Ellipsis() {
  return (
    <span className="ell" aria-hidden="true">
      <i>.</i>
      <i>.</i>
      <i>.</i>
    </span>
  );
}

export default function QrLinkPanel({
  status,
  hasProgress,
  onDone,
}: {
  status: SyncStatus;
  hasProgress: boolean;
  /** Adoption landed — the sub-panel has nothing left to show. */
  onDone: () => void;
}) {
  const { actions } = useApp();
  /* A device with progress is nearly always the one with something to give; a
     fresh one is nearly always the one that wants it. */
  const [mode, setMode] = useState<Mode>(hasProgress ? "send" : "get");
  const [scanning, setScanning] = useState(false);
  const [showQr, setShowQr] = useState(false);
  /* The other device arrived while the square was up: the modal shows the win
     for a beat before everything collapses. */
  const [linked, setLinked] = useState(false);
  const [reachable, setReachable] = useState(true);
  const [target, setTarget] = useState("");
  /* One code per opening of this panel, minted lazily so a re-render or a flip
     between the modes keeps showing the same square. */
  const [minted] = useState(sync.mintCode);
  /* An adoption already happened; a restarted effect must not go round again. */
  const settled = useRef(false);

  const enabled = status.enabled;
  const code = status.code ?? minted;
  const closeScan = useCallback(() => setScanning(false), []);
  const closeQr = useCallback(() => setShowQr(false), []);
  /* The freshest stamp the server has credited to this device, mirrored into
     a ref so the watch below can read it without restarting. A row wearing an
     acknowledged stamp is this device's own push landing, not the other one
     arriving. */
  const acked = useRef(status.serverAt);
  acked.current = status.serverAt;
  /* Same trick for "is the square up". The watch has to branch on it and must
     not be torn down and rebuilt every time the modal opens or shuts. */
  const qrUp = useRef(showQr);
  qrUp.current = showQr;
  const winTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (winTimer.current !== null) clearTimeout(winTimer.current);
    },
    []
  );

  /* Get mode's watch. Stable deps only, or every render would restart it. */
  useEffect(() => {
    if (mode !== "get" || settled.current) return;
    let live = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    /* Sync already on: the row under this code is ours, so only a stamp newer
       than the one there now is the other device arriving. Sync off: there is
       no row of ours to confuse it with, so any row at all is. The baseline is
       measured on the first peek that answers — an unreachable cloud says
       nothing, and guessing zero there would read our own next write as them. */
    let baseline: number | null = enabled ? null : 0;

    const later = (): void => {
      timer = setTimeout(() => void tick(), POLL_MS);
    };

    const arrived = async (): Promise<void> => {
      live = false;
      settled.current = true;
      /* The reader chose to receive, so the cloud copy wins either way: join
         hands it the win by fiat, syncNow(true) does the same for a device
         already on this code. An adoption toasts itself through the store. */
      const out = enabled ? await sync.syncNow(true) : await sync.join(code);
      if (out === "failed") {
        actions.toast(
          enabled
            ? "Can't reach the cloud — progress is safe here"
            : "Connected — cloud unreachable right now, will keep trying"
        );
      } else {
        /* Two devices finding each other is a terminus-worthy moment in a
           fourteen-station app, so it gets what a station clear gets. Not on a
           failed exchange: nothing linked. */
        actions.celebrate({ kind: "confetti", n: 12 });
      }
      /* If the square is still up it says so itself first — collapsing the
         screen out from under a reader mid-scan reads as a crash, not a win. */
      if (qrUp.current) {
        setLinked(true);
        winTimer.current = setTimeout(() => {
          setShowQr(false);
          onDone();
        }, WIN_MS);
        return;
      }
      onDone();
    };

    const tick = async (): Promise<void> => {
      const r = await sync.probe(code);
      if (!live) return;
      setReachable(r !== "unreachable");
      if (r === "unreachable") {
        later();
        return;
      }
      const at = r === "none" ? 0 : r.at;
      if (baseline === null) baseline = at;
      /* Arrival is a stamp newer than when the watch began that the server
         has *not* credited to this device — without the second check, our own
         debounced push moving the row would read as the other one arriving.
         What's left is one round trip: a push that has moved the row but
         whose acknowledgment isn't home yet. */
      else if (at > baseline && at > acked.current) {
        void arrived();
        return;
      }
      later();
    };

    void tick();
    return () => {
      live = false;
      if (timer !== null) clearTimeout(timer);
    };
  }, [mode, code, enabled, actions, onDone]);

  const copyCode = useCallback(() => {
    try {
      if (navigator.clipboard) {
        // Optimistic, same as Export and Copy code; a denied clipboard is not an error.
        navigator.clipboard.writeText(code).catch(() => {});
        actions.toast("Code copied");
      }
    } catch {
      /* no clipboard here — the code is still on screen to copy by hand */
    }
  }, [actions, code]);

  function doSend() {
    const parsed = parseLink(target);
    if (!parsed) {
      actions.toast("That doesn't look like a sync code");
      return;
    }
    /* This is the send row, so the direction is send whatever the pasted link
       says — and it goes to the consent card like every other directive. */
    actions.openLink({ code: parsed.code, dir: "send" });
    setTarget("");
  }

  /* The scanner and the square are both full-screen and both about the same
     handshake; two of them at once is a bug the reader has to back out of. */
  function openScan() {
    setShowQr(false);
    setScanning(true);
  }
  function openQr() {
    setScanning(false);
    setShowQr(true);
  }

  const getHint = "Scan with the device that has your progress";
  const sendHint = "Scan with the device you want to link";

  return (
    <>
      {scanning && <ScanOverlay onClose={closeScan} />}
      {showQr && (
        <QrModal
          value={linkUrl(code, mode === "get" ? "send" : "recv")}
          code={code}
          hint={mode === "get" ? getHint : sendHint}
          label={
            mode === "get"
              ? "QR code — scan it with the device that has your progress"
              : "QR code — scan it with the device you want to link"
          }
          linked={linked}
          onCopy={copyCode}
          onClose={closeQr}
        />
      )}
      {/* Scanning needs no direction chosen: the square being read carries it. */}
      {scanSupported() && (
        <div className="mrow">
          <button className="mbtn" onClick={openScan}>
            Scan a code
          </button>
        </div>
      )}

      <div className="mrow" role="group" aria-label="What this device should do">
        <button className="mbtn" aria-pressed={mode === "get"} onClick={() => setMode("get")}>
          Get progress
        </button>
        <button className="mbtn" aria-pressed={mode === "send"} onClick={() => setMode("send")}>
          Send progress
        </button>
      </div>

      {mode === "get" ? (
        <>
          <div className="mrow">
            <button className="mbtn ico" onClick={openQr}>
              <Icon name="qr-code" size={14} />
              Show the QR
            </button>
          </div>
          <button className="synccode" onClick={copyCode} title="Tap to copy">
            {code}
          </button>
          <p className="storenote">
            Show the square to the device that has your progress — it sends, this one
            receives. No camera there? Enter the code above under “I have a code”.
          </p>
          {(enabled || hasProgress) && (
            <p className="storenote warn">
              {enabled
                ? "What arrives replaces the progress here — and on every device already on this code. Export first if it's worth keeping."
                : "This device has progress. What arrives replaces it — export first if it's worth keeping."}
            </p>
          )}
          <p className="storenote waiting" role="status">
            {reachable ? (
              <>
                {WAITING}
                <Ellipsis />
              </>
            ) : (
              UNREACHABLE
            )}
          </p>
        </>
      ) : (
        <>
          {enabled ? (
            <>
              <div className="mrow">
                <button className="mbtn ico" onClick={openQr}>
                  <Icon name="qr-code" size={14} />
                  Show the QR
                </button>
              </div>
              <button className="synccode" onClick={copyCode} title="Tap to copy">
                {code}
              </button>
              <p className="storenote">
                Show the square to the other device — it adopts the progress on this one,
                and the two stay linked from there.
              </p>
            </>
          ) : (
            <>
              <p className="storenote">
                Two ways round: turn sync on and hold up a code of your own, or send to
                the code the other device is already showing.
              </p>
              <div className="mrow">
                {/* No toast: the square's button appearing is the receipt. */}
                <button
                  className="mbtn"
                  onClick={() => {
                    sync.enable();
                  }}
                >
                  Turn on sync &amp; show the code
                </button>
              </div>
            </>
          )}
          {/* The typed way round, with or without a code of our own yet. Like
              every other entry, it only proposes — the card does the deed. */}
          <div className="mrow">
            <input
              className="syncinput"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Or paste a code or link"
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              aria-label="Code to send this device's progress to"
            />
            <button className="mbtn" onClick={doSend}>
              Send to a code
            </button>
          </div>
        </>
      )}
    </>
  );
}
