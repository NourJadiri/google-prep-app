/** Whether this browser can scan at all: it needs a camera and nothing else, since jsQR carries the decoding. */
export function scanSupported(): boolean {
  return typeof window !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function";
}
