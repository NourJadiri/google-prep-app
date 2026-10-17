/* Imported statically, not on the button press: there is no service worker, so a split chunk would be a network request at the moment someone is standing in front of another screen with no signal. */
import jsQR from "jsqr";

/* jsQR walks every pixel, so a 1080p frame is nine times the work for a symbol that fills the same fraction of the picture.
   640 still leaves a code on another screen a few pixels a module, which is where jsQR stops being able to read one. */
const MAX_EDGE = 640;

/** Reads QR text off video frames in JavaScript, through one canvas that lives as long as the reader. */
export function createJsQrReader(): (video: HTMLVideoElement) => Promise<string[]> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  return async (video) => {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!ctx || !vw || !vh) return [];
    const scale = Math.min(1, MAX_EDGE / Math.max(vw, vh));
    const w = Math.max(1, Math.round(vw * scale));
    const h = Math.max(1, Math.round(vh * scale));
    /* Resizing a canvas clears it, so only do it when the camera changes shape. */
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.drawImage(video, 0, 0, w, h);
    const frame = ctx.getImageData(0, 0, w, h);
    /* A screen or a print is dark on light; each other inversion attempt is another full pass. */
    const hit = jsQR(frame.data, w, h, { inversionAttempts: "dontInvert" });
    return hit ? [hit.data] : [];
  };
}
