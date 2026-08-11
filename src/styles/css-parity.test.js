import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/* The stylesheet was split across component files rather than rewritten. This
   test re-flattens it and asserts every rule the reference draws still exists,
   so a refactor can move rules around but never quietly drop one. */

const ROOT = path.resolve(import.meta.dirname, "../..");

const FILES = [
  "src/styles/tokens.css",
  "src/styles/base.css",
  "src/styles/layout.css",
  "src/components/shared/shared.css",
  "src/components/layout/Header.css",
  "src/components/layout/TabBar.css",
  "src/components/line/line.css",
  "src/components/metro/metro.css",
  "src/components/dojo/dojo.css",
  "src/components/me/me.css",
];

/* Deliberate additions: transparent overlays that lift the small round controls
   to a ~44px touch target without moving anything on screen. */
const ADDED = [
  ".prow .pcheck,.prow .golink{",
  ".prow .pcheck::after,.prow .golink::after{",
  ".ritual,.timer .tbtn,.deck,.mbtn,.quit,.next,.veil button,.dojo-log button{",
  ".ritual::after{",
  ".timer .tbtn::after{",
  ".deck::after,.mbtn::after,.veil button::after,.dojo-log button::after,.quit::after,.next::after{",
];

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");
const norm = (s) =>
  strip(s).replace(/\s+/g, " ").replace(/\s*([{};:,])\s*/g, "$1").trim();

/* Split into top-level rule blocks, keeping @media blocks whole. */
function blocks(css) {
  const src = strip(css);
  const out = [];
  let depth = 0;
  let buf = "";
  for (const ch of src) {
    buf += ch;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        out.push(norm(buf));
        buf = "";
      }
    }
  }
  return out.filter(Boolean);
}

describe("stylesheet parity with the reference", () => {
  const ref = fs
    .readFileSync(path.join(ROOT, "reference/onsite-express.html"), "utf8")
    .match(/<style>([\s\S]*?)<\/style>/)[1];
  const mine = FILES.map((f) => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n");

  const refBlocks = blocks(ref);
  const myBlocks = new Set(blocks(mine));

  it("keeps every rule the reference declares", () => {
    const missing = refBlocks.filter((b) => !myBlocks.has(b));
    expect(missing).toEqual([]);
  });

  it("adds nothing beyond the documented touch-target overlays", () => {
    const refSet = new Set(refBlocks);
    const extra = [...myBlocks].filter((b) => !refSet.has(b));
    expect(extra.every((b) => ADDED.some((a) => b.startsWith(a)))).toBe(true);
    expect(extra).toHaveLength(ADDED.length);
  });

  it("ports both palettes and the reduced-motion escape hatch", () => {
    expect(mine).toContain("--blue: #1a73e8");
    expect(mine).toContain("--blue: #8ab4f8");
    expect(mine).toContain("prefers-color-scheme: dark");
    expect(mine).toContain("prefers-reduced-motion: reduce");
    expect(mine).not.toMatch(/@import|url\(\s*['"]?https?:/); // nothing fetched at runtime
  });
});
