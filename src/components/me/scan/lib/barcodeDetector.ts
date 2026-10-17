/* TypeScript ships no lib for the Barcode Detection API, so the part used here is declared and the window is read through one narrow cast. */
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<Array<{ rawValue: string }>>;
}
interface BarcodeDetectorCtor {
  new (opts?: { formats?: string[] }): BarcodeDetectorLike;
}

/** The browser's own QR detector, or null where it is missing or doesn't read QR (a Chromium carrying the class but not the format throws). */
export function nativeQrDetector(): BarcodeDetectorLike | null {
  const Ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
  if (!Ctor) return null;
  try {
    return new Ctor({ formats: ["qr_code"] });
  } catch {
    return null;
  }
}
