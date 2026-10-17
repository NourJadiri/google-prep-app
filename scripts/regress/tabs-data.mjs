// tabs-data.mjs: the app's content (the plans, the quiz bank, the dojo templates, the ranks), read from
// the checkout this suite lives in, so the Tabs suite can say what a station, a card or a template ought to
// look like without copying 120 cards into itself. Only data modules are read (they import nothing but
// types), and esbuild, which Vite brings along, turns them into plain JavaScript in memory.
//
// What the suite expects of the UI's own words (toast texts, labels, headings, the board's tags) is written
// out in the suite; what it takes from here is content: the order of the stations, which problems a station
// holds, what a card asks and which option is the right one.

import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const ENTRY = `
export { Q, DECKS, CATN } from "./src/data/questions.ts";
export { PLAN, DIFFN, XPD, RITUAL_XP, LC } from "./src/data/plan.ts";
export { AWS_PLAN } from "./src/data/aws.ts";
export { TPL } from "./src/data/templates.ts";
export { RANKS, AWS_RANKS, RANKCOL, AWS_RANKCOL, BADGES } from "./src/data/meta.ts";
`;

export async function loadData() {
  const out = await build({
    stdin: { contents: ENTRY, resolveDir: ROOT, sourcefile: "tabs-data-entry.ts", loader: "ts" },
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
    logLevel: "silent",
  });
  const d = await import("data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64"));
  return { ...d, probXP: (p) => p.xp || d.XPD[p.diff] };
}
