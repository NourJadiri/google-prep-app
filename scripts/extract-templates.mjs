// Copies the Dojo templates out of the reference app into src/data/templates.ts, byte for byte.
// Run from the repo root: node scripts/extract-templates.mjs. An empty `git diff` afterwards means the
// ported content is untouched. The plan, ranks, badges and quiz bank grew past the reference by hand,
// so they are no longer extracted.
import fs from "node:fs";

const MARKER = "/* Templates for the dojo */";
const OUT = "src/data/templates.ts";

const html = fs.readFileSync("reference/onsite-express.html", "utf8");
const data = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
const start = data.indexOf(MARKER);
if (start === -1) throw new Error("marker not found: " + MARKER);

const templates = data
  .slice(start + MARKER.length)
  .trim()
  .replace(/^const TPL( *)=/m, "export const TPL: Template[]$1=");

fs.writeFileSync(
  OUT,
  "// Ported verbatim from reference/onsite-express.html by scripts/extract-templates.mjs: edit there, not here.\n" +
    'import type { Template } from "../types";\n\n' +
    templates +
    "\n"
);
console.log("wrote " + OUT);
