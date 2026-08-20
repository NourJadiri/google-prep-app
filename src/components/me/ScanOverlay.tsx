import { useEffect, useRef, useState } from "react";
import { useApp } from "../../state/AppState";
import { parseLink } from "../../lib/link";

/* The camera, and only ever as a shortcut. A QR here is a plain link to this
   app, so the phone's own camera app already opens it — what this overlay buys
   is the other direction, a laptop reading a phone's screen. It stays behind a
   feature gate and never becomes the way linking is meant to work: every
   browser without it still has the code, the paste box and the link itself.

   Nothing is acted on here either. A hit becomes a directive in the store and
   the consent card asks, exactly as if the link had been opened by hand. */

const TICK_MS = 250;
/* How long "that wasn't ours" stays on screen before the hint comes back. */
const MISS_MS = 2_200;
const HINT = "Point the camera at the code on the other device.";
const DENIED = "Camera access is off — type the code in instead.";

/* The Barcode Detection API, as much of it as this file touches. TypeScript
   ships no lib for it, so the shape is declared here and the window is read
   through one narrow cast — the same trust-boundary move storage makes with
   the parsed blob: assert exactly what you are about to use, then use only
   that. The feature gate below is what makes the cast honest. */
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}
interface BarcodeDetectorCtor {
  new (opts?: { formats?: string[] }): BarcodeDetectorLike;
}

const detectorCtor = (): BarcodeDetectorCtor | null =>
  (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector ?? null;

/** Whether this browser can scan at all. Safari and Firefox can't today, which
 *  is why the launcher is rendered only when this says so. */
export function scanSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "BarcodeDetector" in window &&
    typeof navigator.mediaDevices?.getUserMedia === "function"
  );
}

/* getUserMedia rejects with a DOMException, but a catch binding is `unknown`
   and the name is what picks the wording. */
const errName = (e: unknown): string =>
  typeof e === "object" && e !== null && "name" in e
    ? String((e as { name: unknown }).name)
    : "";

export default function ScanOverlay({ onClose }: { onClose: () => void }) {
  const { actions } = useApp();
  const video = useRef<HTMLVideoElement>(null);
  const [note, setNote] = useState(HINT);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const Detector = detectorCtor();
    let live = true;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let missAt = 0;

    /* The one teardown, called by the cleanup, by a hit, and by a failure —
       a camera left running is a light left on. */
    const stopAll = (): void => {
      live = false;
      if (timer !== null) clearInterval(timer);
      timer = null;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      stream = null;
    };

    const fail = (msg: string): void => {
      stopAll();
      setBroken(true);
      setNote(msg);
    };

    const camera = async (): Promise<MediaStream | null> => {
      try {
        /* The back camera on a phone; a laptop has one and ignores the ask. */
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
      } catch (e) {
        if (errName(e) === "NotAllowedError") {
          fail(DENIED);
          return null;
        }
        try {
          /* Some browsers refuse a constraint rather than approximate it. */
          return await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (e2) {
          fail(
            errName(e2) === "NotAllowedError"
              ? DENIED
              : "No camera here — type the code in instead."
          );
          return null;
        }
      }
    };

    const scan = async (det: BarcodeDetectorLike, el: HTMLVideoElement): Promise<void> => {
      /* HAVE_CURRENT_DATA: before that there is no frame to read. */
      if (!live || el.readyState < 2) return;
      let hits: DetectedBarcode[];
      try {
        hits = await det.detect(el);
      } catch {
        return; /* a frame the detector didn't like; the next one is 250ms away */
      }
      if (!live) return;
      for (const hit of hits) {
        const d = parseLink(hit.rawValue);
        if (d) {
          stopAll();
          onClose();
          actions.openLink(d);
          return;
        }
      }
      if (hits.length) {
        missAt = Date.now();
        setNote("That code isn't one of this app's — still looking.");
      }
    };

    const run = async (): Promise<void> => {
      if (!Detector) return; /* gated by the caller; this satisfies the type */
      const s = await camera();
      if (!s) return;
      if (!live) {
        /* Unmounted while the permission prompt was up. */
        s.getTracks().forEach((t) => t.stop());
        return;
      }
      stream = s;
      const el = video.current;
      if (!el) {
        stopAll();
        return;
      }
      el.srcObject = s;
      try {
        await el.play();
      } catch {
        /* autoPlay covers the rest; a paused first frame still scans. */
      }
      /* Unmounted while the video warmed up: the cleanup has already stopped
         everything, so there is nothing left here to start. */
      if (!live) return;
      const det = new Detector({ formats: ["qr_code"] });
      timer = setInterval(() => {
        if (missAt && Date.now() - missAt > MISS_MS) {
          missAt = 0;
          setNote(HINT);
        }
        void scan(det, el);
      }, TICK_MS);
    };

    void run();
    return stopAll;
  }, [actions, onClose]);

  return (
    <div className="scanwrap" role="dialog" aria-label="Scan a linking code">
      {!broken && <video ref={video} className="scanvid" playsInline muted autoPlay />}
      <p className="scannote" role="status">
        {note}
      </p>
      <button className="mbtn" onClick={onClose}>
        Cancel
      </button>
    </div>
  );
}
