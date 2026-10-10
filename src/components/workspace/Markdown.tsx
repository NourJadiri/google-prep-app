import { useMemo } from "react";
import { marked } from "marked";

/* Problem text is ours — bundled, reviewed, never user input — so marked's
   HTML goes in as is. GFM for the fenced blocks; no soft-break magic. */
marked.use({ gfm: true, breaks: false });

export interface Section {
  title: string;
  body: string;
}

/** A statement's ## sections, in order. The title line and any lead before
 *  the first section are dropped: the workspace header already says them.
 *  Fence-aware, so a `## ` inside a code block stays code. */
export function sections(md: string): Section[] {
  const out: Section[] = [];
  let cur: Section | null = null;
  let fenced = false;
  for (const line of md.replace(/\r\n/g, "\n").split("\n")) {
    if (/^(```|~~~)/.test(line)) fenced = !fenced;
    if (!fenced && line.startsWith("## ")) {
      cur = { title: line.slice(3).trim(), body: "" };
      out.push(cur);
    } else if (cur) {
      cur.body += line + "\n";
    }
  }
  return out;
}

/** Everything after the first ## — what "Copy for Claude" and the reader
 *  share, minus the header's own lines. */
export function withoutLead(md: string): string {
  const i = md.search(/^## /m);
  return i < 0 ? md : md.slice(i);
}

export function Md({ text, className = "md" }: { text: string; className?: string }) {
  const html = useMemo(() => marked.parse(text, { async: false }), [text]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
