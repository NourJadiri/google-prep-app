import { Marked } from "marked";

/* Problem text is ours (bundled, reviewed, never user input), so marked's HTML goes in as is. */
const problemText = new Marked({ gfm: true, breaks: false });

export const renderMarkdown = (text: string): string => problemText.parse(text, { async: false });

export interface Section {
  title: string;
  body: string;
}

/** A statement's ## sections, in order. The title line and any lead before the first section are dropped: the
 *  workspace header already says them. Fence-aware, so a `## ` inside a code block stays code. */
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

/** Everything from the first ## on: the statement minus the header's own lines. */
export function withoutLead(md: string): string {
  const i = md.search(/^## /m);
  return i < 0 ? md : md.slice(i);
}
