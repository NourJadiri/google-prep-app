import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { useApp } from "../../state/AppState";
import { parseLink } from "../../lib/link";

/* The camera, and only ever as a shortcut. A QR here is a plain link to this
   app, so the phone's own camera app already opens it — what this overlay buys
   is the two cases that route cannot serve: a laptop reading a phone's screen,
   and an iOS home-screen install, whose storage is its own and which a
   camera-app scan has no way of opening. Both of those need a camera *inside*
   this app. It is still never how linking is meant to work: every browser has
   the code, the paste box and the link itself.

   Two decoders, one gate. `BarcodeDetector` is the browser's own — often the
   camera hardware's — and it is taken wherever it exists, which today means
   Chromium. Everywhere else, Safari above all, the frames go through jsQR in
   JavaScript — a real weight in the bundle, taken because the browser that most
   needs an in-app scanner is the one that will never ship a decoder of its own.

   Nothing is acted on here either. A hit becomes a directive in the store and
   the consent card asks, exactly as if the link had been opened by hand. */

/* jsQR is imported statically, not fetched on the button press. There is no
   service worker here, so a lazily-split chunk would be a network request at
   the exact moment someone is standing in front of another screen with no
   signal — and the whole app already arrives in one download by design. */

const TICK_MS = 250;
/* How long "that wasn't ours" stays on screen before the hint comes back. */
const MISS_MS = 2_200;
/* Longest edge jsQR is handed. It walks every pixel, so a 1080p frame is nine
   times the work for a symbol that fills the same fraction of the picture
   either way; 640 still leaves a code on another screen a few pixels a module,
   which is where jsQR stops being able to read one. */
const MAX_EDGE = 640;
const HINT = "Point the camera at the code on the other device.";
const DENIED = "Camera access is off — type the code in instead.";

/* The Barcode Detection API, as much of it as this file touches. TypeScript
   ships no lib for it, so the shape is declared here and the window is read
   through one narrow cast — the same trust-boundary move storage makes with
   the parsed blob: assert exactly what you are about to use, then use only
   that. What makes the cast honest is that absence is a supported answer:
   every route out of it lands on jsQR rather than on a crash. */
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

/** Whether this browser can scan at all. The bar is a camera and nothing else
 *  now that decoding is carried in the bundle — so the launcher renders on
 *  Safari and Firefox too, and only an insecure origin or a device with no
 *  camera at all is left out. */
export function scanSupported(): boolean {
  return (
    typeof window !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function"
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
    let live = true;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let missAt = 0;

    /* Which decoder this overlay gets, decided once. A constructor that throws
       — a Chromium carrying the class but not the format — is simply one more
       browser that reads with jsQR. */
    const det = ((): BarcodeDetectorLike | null => {
      const Ctor = detectorCtor();
      if (!Ctor) return null;
      try {
        return new Ctor({ formats: ["qr_code"] });
      } catch {
        return null;
      }
    })();

    /* jsQR reads pixels, so a frame has to land somewhere first. One canvas for
       the life of the overlay — a fresh bitmap four times a second is work for
       the collector and nothing else — and `willReadFrequently`, because this
       canvas exists only to be read back and never to be shown. */
    const canvas = det ? null : document.createElement("canvas");
    const ctx = canvas?.getContext("2d", { willReadFrequently: true }) ?? null;

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

    /* One frame in, whatever QR text it holds out. The whole difference between
       the two browsers lives in here, and the loop above never learns which one
       it is talking to. */
    const read = async (el: HTMLVideoElement): Promise<string[]> => {
      if (det) return (await det.detect(el)).map((b) => b.rawValue);
      const vw = el.videoWidth;
      const vh = el.videoHeight;
      if (!ctx || !canvas || !vw || !vh) return [];
      const scale = Math.min(1, MAX_EDGE / Math.max(vw, vh));
      const w = Math.max(1, Math.round(vw * scale));
      const h = Math.max(1, Math.round(vh * scale));
      /* Resizing a canvas clears it, so only do it when the camera actually
         changes shape — a rotation, or the first frame. */
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.drawImage(el, 0, 0, w, h);
      const frame = ctx.getImageData(0, 0, w, h);
      /* `dontInvert`: what is being read is a screen or a print, both of them
         dark-on-light. The other attempts are another full pass each, for a
         case this app does not have. */
      const hit = jsQR(frame.data, w, h, { inversionAttempts: "dontInvert" });
      return hit ? [hit.data] : [];
    };

    const scan = async (el: HTMLVideoElement): Promise<void> => {
      /* HAVE_CURRENT_DATA: before that there is no frame to read. */
      if (!live || el.readyState < 2) return;
      let hits: string[];
      try {
        hits = await read(el);
      } catch {
        return; /* a frame the decoder didn't like; the next one is 250ms away */
      }
      if (!live) return;
      for (const raw of hits) {
        const d = parseLink(raw);
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
      timer = setInterval(() => {
        if (missAt && Date.now() - missAt > MISS_MS) {
          missAt = 0;
          setNote(HINT);
        }
        void scan(el);
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
