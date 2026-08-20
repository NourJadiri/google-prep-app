import { useEffect, useRef } from "react";
import QrCode from "../shared/QrCode";
import Icon from "../shared/Icon";

/* The square, big enough to actually be scanned.
 *
 * Linking is the one moment in this app where the screen is not for the person
 * holding it — it is for a camera a foot away, in whatever light the room has.
 * A 240px card in a scrolling column was a compromise for a surface nobody was
 * pointing anything at. So: full screen, dark scrim, one white card, nothing
 * else competing. The scrim is darker than the scanner's on purpose — a phone
 * metering the whole frame opens up for the dark surround and stops blowing
 * out the white card, which is where the modules are.
 *
 * Pure display. The Get-mode poll belongs to QrLinkPanel and keeps running
 * whether this is open or shut — closing the square must never be the same
 * thing as calling off the link, because the reader will do it by reflex.
 */

export default function QrModal({
  value,
  code,
  hint,
  label,
  linked,
  onCopy,
  onClose,
}: {
  /** The link the square encodes. */
  value: string;
  /** Same code as text, because a square is not always readable. */
  code: string;
  hint: string;
  label: string;
  /** The other device arrived while this was open: show the win, then go. */
  linked: boolean;
  onCopy: () => void;
  onClose: () => void;
}) {
  const closeBtn = useRef<HTMLButtonElement>(null);

  /* Focus goes to Close on open and back where it came from on the way out.
     Captured rather than passed in: the opener is whichever button rendered
     this, and asking every caller to thread a ref would be worse. */
  useEffect(() => {
    const opener = document.activeElement;
    closeBtn.current?.focus();
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  /* Escape closes, the way every dialog on the reader's phone does. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="qrscrim"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      /* mousedown, not click: a drag that starts on the card and ends on the
         scrim is a text selection, not a dismissal. */
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
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
            <div className="qrbig">
              <QrCode value={value} label={label} />
            </div>
            <button className="synccode" onClick={onCopy} title="Tap to copy">
              {code}
            </button>
            <p className="qrhint">{hint}</p>
          </>
        )}
        <button className="mbtn" ref={closeBtn} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
