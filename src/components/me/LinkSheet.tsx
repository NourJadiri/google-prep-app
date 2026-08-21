import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../../state/AppState";
import * as sync from "../../lib/sync";
import type { SyncStatus } from "../../lib/sync";
import { linkUrl, parseLink } from "../../lib/link";
import QrCode from "../shared/QrCode";
import Icon from "../shared/Icon";
import { scanSupported } from "./ScanOverlay";

/* Linking two devices, all of it, on one screen.
 *
 * This used to be a sub-panel that expanded inside the Me tab and a modal it
 * could open — a mode toggle, a Show-the-QR button, a second copy of the code
 * chip and a paste row, all stacked as identical pills under the sync
 * controls. Nothing said which of them was the thing you came for. So the
 * whole surface is the sheet now: you tap "Link a device" and the screen is
 * about linking a device until you leave.
 *
 * The QR is a link to this app carrying a code and an instruction for whoever
 * scans it, so the two modes are named for what *this* device wants — "Get
 * progress" shows a code that says `do=send`, "Send progress" shows one that
 * says `do=recv`. The verb is inverted on purpose: the reader thinks about
 * their own device, and the other device gets told what to do.
 *
 * Get mode is the only place in the app that waits on the cloud. There is
 * nothing to subscribe to — the store is one dumb row — so it peeks at the row
 * every few seconds and stops the moment the other device writes. Nothing is
 * enabled until that happens: a code nobody scans leaves no row, no config and
 * no trace.
 *
 * The watch lives and dies with this component, which is the deliberate part.
 * An earlier version kept it running behind a closed square, on the theory
 * that dismissing a picture shouldn't call off a handshake. It made the
 * lifetime impossible to point at — a poll with no visible owner, waiting on a
 * screen the reader had left. Now the sheet *is* the waiting room: while it is
 * open this device is listening, and closing it says so. A device with sync
 * already on loses nothing either way, since ordinary sync converges on the
 * next wake or boot; a fresh one abandons the code it minted, exactly as it
 * always did when the old panel collapsed.
 *
 * White card on a dark scrim, in both themes: the screen is not for the person
 * holding it here, it is for a camera a foot away. The scrim is darker than
 * the scanner's so a phone metering the whole frame stops opening up and
 * blowing out the card, which is where the modules are.
 */

const POLL_MS = 2_500;
const WAITING = "Waiting for the other device";
const UNREACHABLE = "Cloud unreachable — progress here is safe; still watching for the other device.";
/* How long the sheet holds its "Linked" card before it goes. Long enough to
   register as an answer, short enough that nobody reaches for Close. */
const WIN_MS = 1_200;

const GET_LABEL = "QR code — scan it with the device that has your progress";
const SEND_LABEL = "QR code — scan it with the device you want to link";

type Mode = "get" | "send";

/* Three dots the reader can watch, so a poll that takes twenty seconds looks
   like waiting rather than like nothing happening. The characters are real, so
   the line still reads "Waiting for the other device..." to anything that only
   sees text — and it stops moving under prefers-reduced-motion. */
function Ellipsis() {
  return (
    <span className="ell" aria-hidden="true">
      <i>.</i>
      <i>.</i>
      <i>.</i>
    </span>
  );
}

export default function LinkSheet({
  status,
  hasProgress,
  onScan,
  onDone,
}: {
  status: SyncStatus;
  hasProgress: boolean;
  /** Hand the screen to the camera instead. The caller closes this sheet. */
  onScan: () => void;
  /** Close: the reader's Escape, the scrim, Close, or an arrival finishing. */
  onDone: () => void;
}) {
  const { actions } = useApp();
  /* A device with progress is nearly always the one with something to give; a
     fresh one is nearly always the one that wants it. */
  const [mode, setMode] = useState<Mode>(hasProgress ? "send" : "get");
  /* The other device arrived: show the win for a beat, then leave. */
  const [linked, setLinked] = useState(false);
  const [reachable, setReachable] = useState(true);
  const [target, setTarget] = useState("");
  /* One code per opening, minted lazily so a re-render or a flip between the
     modes keeps showing the same square. */
  const [minted] = useState(sync.mintCode);
  /* An adoption already happened; a restarted effect must not go round again.
     `enabled` flips *during* a Get-mode link, so the effect does restart. */
  const settled = useRef(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const winTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enabled = status.enabled;
  const code = status.code ?? minted;
  /* The freshest stamp the server has credited to this device, mirrored into
     a ref so the watch can read it without restarting. A row wearing an
     acknowledged stamp is this device's own push landing, not the other one
     arriving. */
  const acked = useRef(status.serverAt);
  acked.current = status.serverAt;

  /* Focus goes to Close on open and back where it came from on the way out.
     Captured rather than passed in: the opener is whichever button rendered
     this, and asking the caller to thread a ref would be worse. */
  useEffect(() => {
    const opener = document.activeElement;
    closeBtn.current?.focus();
    return () => {
      if (winTimer.current !== null) clearTimeout(winTimer.current);
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  /* Escape closes, the way every dialog on the reader's phone does. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onDone();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onDone]);

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
      /* The sheet says so itself before it goes — pulling the screen out from
         under a reader mid-scan reads as a crash, not as a win. */
      setLinked(true);
      winTimer.current = setTimeout(onDone, WIN_MS);
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
        // Optimistic, same as Export and the panel's chip; a denied clipboard is not an error.
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
    /* This is the send side, so the direction is send whatever the pasted link
       says — and it goes to the consent card like every other directive, which
       is also what closes this sheet. */
    actions.openLink({ code: parsed.code, dir: "send" });
    setTarget("");
  }

  const get = mode === "get";
  /* Send mode with sync off has no code of its own to show yet. */
  const square = get || enabled;

  return (
    <div
      className="qrscrim"
      role="dialog"
      aria-modal="true"
      aria-label="Link a device"
      /* mousedown, not click: a drag that starts on the card and ends on the
         scrim is a text selection, not a dismissal. */
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onDone();
      }}
    >
      <div className="qrsheet">
        {linked ? (
          <div className="qrlinked" role="status">
            <span className="ic">
              <Icon name="check" size={44} strokeWidth={2.5} />
            </span>
            <p>Linked</p>
          </div>
        ) : (
          <>
            {/* The one decision this screen asks for, at the top of it. */}
            <div className="segtoggle" role="group" aria-label="What this device should do">
              <button aria-pressed={get} onClick={() => setMode("get")}>
                Get progress
              </button>
              <button aria-pressed={!get} onClick={() => setMode("send")}>
                Send progress
              </button>
            </div>

            {square ? (
              <>
                <div className="qrbig">
                  <QrCode value={linkUrl(code, get ? "send" : "recv")} label={get ? GET_LABEL : SEND_LABEL} />
                </div>
                <button className="synccode" onClick={copyCode} title="Tap to copy">
                  {code}
                </button>
                <p className="qrhint">
                  {get
                    ? "Scan with the device that has your progress — it sends, this one receives."
                    : "Scan with the device you want to link — it adopts the progress on this one."}
                </p>
              </>
            ) : (
              <div className="qrenable">
                <p className="qrhint">
                  Two ways round: turn sync on and hold up a code of your own, or send to
                  the code the other device is already showing.
                </p>
                {/* No toast: the square appearing is the receipt. */}
                <button
                  className="mbtn"
                  onClick={() => {
                    sync.enable();
                  }}
                >
                  Turn on sync &amp; show the code
                </button>
              </div>
            )}

            {get && (enabled || hasProgress) && (
              <p className="qrwarn">
                {enabled
                  ? "What arrives replaces the progress here — and on every device already on this code. Export first if it's worth keeping."
                  : "This device has progress. What arrives replaces it — export first if it's worth keeping."}
              </p>
            )}
            {get && (
              <p className="qrwait waiting" role="status">
                {reachable ? (
                  <>
                    {WAITING}
                    <Ellipsis />
                  </>
                ) : (
                  UNREACHABLE
                )}
              </p>
            )}

            {/* The ways round, kept quiet: they are what you reach for when the
                square isn't working, not things to weigh against it. */}
            {(!get || scanSupported()) && (
              <div className="sheetsub">
                {!get && (
                  <>
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
                    <button className="sublink" onClick={doSend}>
                      Send to a code
                    </button>
                  </>
                )}
                {scanSupported() && (
                  <button className="sublink" onClick={onScan}>
                    Scan a code instead
                  </button>
                )}
              </div>
            )}
          </>
        )}
        <button className="mbtn" ref={closeBtn} onClick={onDone}>
          Close
        </button>
      </div>
    </div>
  );
}
