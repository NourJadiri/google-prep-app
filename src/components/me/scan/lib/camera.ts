export type CameraFailure = "denied" | "unavailable";
type CameraResult = { stream: MediaStream } | { failure: CameraFailure };

/* A catch binding is `unknown`, and the DOMException's name is what says why. */
const errName = (e: unknown): string =>
  typeof e === "object" && e !== null && "name" in e ? String((e as { name: unknown }).name) : "";

/** The back camera on a phone; a laptop has one and ignores the ask. */
export async function openCamera(): Promise<CameraResult> {
  try {
    return { stream: await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }) };
  } catch (e) {
    if (errName(e) === "NotAllowedError") return { failure: "denied" };
  }
  try {
    /* Some browsers refuse a constraint rather than approximate it. */
    return { stream: await navigator.mediaDevices.getUserMedia({ video: true }) };
  } catch (e) {
    return { failure: errName(e) === "NotAllowedError" ? "denied" : "unavailable" };
  }
}
