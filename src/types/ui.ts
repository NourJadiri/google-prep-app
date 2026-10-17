export type Tab = "line" | "metro" | "dojo" | "me";

/** What THIS device should do with a code from a QR or share link: send its
 *  progress under it, or receive what the cloud holds. Consented to in the UI,
 *  never acted on silently. */
export interface LinkDirective {
  code: string;
  dir: "send" | "recv";
}
