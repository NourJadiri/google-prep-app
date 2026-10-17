import { nativeQrDetector } from "./barcodeDetector";
import { createJsQrReader } from "./jsqrReader";

/** One video frame in, the text of every QR in it out. */
export type FrameDecoder = (video: HTMLVideoElement) => Promise<string[]>;

/** The browser's detector wherever it reads QR (Chromium, often in the camera hardware), jsQR everywhere else, Safari above all. */
export function chooseDecoder(): FrameDecoder {
  const native = nativeQrDetector();
  if (!native) return createJsQrReader();
  return async (video) => (await native.detect(video)).map((b) => b.rawValue);
}
