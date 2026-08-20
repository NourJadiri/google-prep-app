/* The device-linking link: what a QR code actually contains.
 *
 *   ${origin}${pathname}#sync=<code>&do=send|recv
 *
 * A plain link to the app itself, so the phone's own camera app is the
 * scanner — no second app to install, and a device that already has this one
 * installed just opens it. `do` is the instruction for whoever *scans*: "send"
 * means push your progress under this code, "recv" means adopt what the cloud
 * holds there.
 *
 * The payload rides in the fragment on purpose. A sync code is a bearer token;
 * a query string reaches the server and every log and referrer along the way,
 * a fragment never leaves the browser. The same reasoning is why parsing here
 * is strict and never generous: a link can overwrite a device's progress or
 * the cloud's, so what this module produces is a *proposal*, and the consent
 * card is the only thing that ever carries one out.
 */

import type { LinkDirective } from "../types";

/* The same rule sync.ts and the server enforce, kept here too so a mangled
   scan fails at parse time rather than three layers down. sync.ts holds its
   copy private, and a shared constant would be an import for four tokens. */
const CODE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{7,63}$/;

/** The link to put in a QR. Origin and path come from wherever this app is
 *  actually being served, so a preview deploy links to itself and not to
 *  production. Nothing needs escaping: CODE_RE's alphabet is URL-safe. */
export function linkUrl(code: string, dir: "send" | "recv"): string {
  return `${location.origin}${location.pathname}#sync=${code}&do=${dir}`;
}

function fromHash(hash: string): LinkDirective | null {
  const q = new URLSearchParams(hash.replace(/^#/, ""));
  const code = q.get("sync");
  if (!code || !CODE_RE.test(code)) return null;
  /* A missing or unrecognised verb reads as "receive" — exactly what a bare
     code has always meant when typed into Connect. */
  return { code, dir: q.get("do") === "send" ? "send" : "recv" };
}

/** Read a directive out of whatever the reader handed over: a scanned URL, a
 *  pasted fragment, or a bare code. A near miss is null, not a guess, because
 *  the guess would be acted on against someone's progress. */
export function parseLink(text: string): LinkDirective | null {
  const raw = text.trim();
  if (!raw) return null;
  /* A scan is almost always a whole URL. Any origin is accepted — the app also
     lives on preview deploys, LAN addresses and forks — because the origin
     grants nothing here; the code is the only thing that means anything. */
  try {
    const { hash } = new URL(raw);
    if (hash) return fromHash(hash);
  } catch {
    /* Not a URL: fall through to the shorter forms. */
  }
  if (raw.startsWith("#")) return fromHash(raw);
  return CODE_RE.test(raw) ? { code: raw, dir: "recv" } : null;
}

/** Take the directive this page was opened with, if there is one, and scrub
 *  the hash on the way out so a reload can't re-offer it. That scrub is also
 *  what makes StrictMode's double mount a non-event: the second call finds an
 *  empty hash and returns null. A fragment we don't understand is left alone. */
export function consumeHashLink(): LinkDirective | null {
  const link = parseLink(location.hash);
  if (!link) return null;
  try {
    history.replaceState(null, "", location.pathname + location.search);
  } catch {
    /* Exotic origins (file://, some embeds) refuse replaceState. The directive
       is still good; the hash just lingers in the address bar. */
  }
  return link;
}
