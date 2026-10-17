import type { LinkDirective } from "../types";
import { isSyncCode } from "./syncCode";

/* The code is a bearer token, so it rides in the fragment: a query string reaches servers and logs, a fragment never leaves the browser. */
export function linkUrl(code: string, dir: "send" | "recv"): string {
  return `${location.origin}${location.pathname}#sync=${code}&do=${dir}`;
}

function fromHash(hash: string): LinkDirective | null {
  const q = new URLSearchParams(hash.replace(/^#/, ""));
  const code = q.get("sync");
  if (!code || !isSyncCode(code)) return null;
  return { code, dir: q.get("do") === "send" ? "send" : "recv" };
}

/** A near miss is null, not a guess: the guess would be acted on against someone's progress. */
export function parseLink(text: string): LinkDirective | null {
  const raw = text.trim();
  if (!raw) return null;
  try {
    const { hash } = new URL(raw);
    if (hash) return fromHash(hash);
  } catch {
    /* Not a URL: fall through to the shorter forms. */
  }
  if (raw.startsWith("#")) return fromHash(raw);
  return isSyncCode(raw) ? { code: raw, dir: "recv" } : null;
}

/** Scrubbing the hash is what keeps a reload or StrictMode's second mount from offering the link twice. */
export function consumeHashLink(): LinkDirective | null {
  const link = parseLink(location.hash);
  if (!link) return null;
  try {
    history.replaceState(null, "", location.pathname + location.search);
  } catch {
    /* file:// and some embeds refuse replaceState; the link is still good. */
  }
  return link;
}
