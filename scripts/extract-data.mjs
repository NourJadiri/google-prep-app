// Slices the reference's data <script> block into ES modules, verbatim.
// Run from the repo root: node scripts/extract-data.mjs
import fs from "node:fs";

const html = fs.readFileSync("reference/onsite-express.html", "utf8");
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const data = blocks[0];

const at = (needle) => {
  const i = data.indexOf(needle);
  if (i === -1) throw new Error("marker not found: " + needle);
  return i;
};

const iLC = at("const LC =");
const iPLAN = at("const PLAN = [");
const iRANKS = at("const RANKS = [");
const iBADGES = at("const BADGES = [");
const iQ = at("/* Quiz bank.");
const iTPL = at("/* Templates for the dojo */");

const seg = (a, b) => data.slice(a, b === undefined ? undefined : b).trim() + "\n";
const exported = (s) => s.replace(/^const /gm, "export const ");

const banner = (what) =>
  `// ${what} — ported verbatim from reference/onsite-express.html.\n` +
  `// Content is ground truth: do not rewrite, reword or reorder.\n\n`;

const head = exported(seg(iLC, iPLAN));
const plan = exported(seg(iPLAN, iRANKS));
const ranks = exported(seg(iRANKS, iBADGES));
const badges = exported(seg(iBADGES, iQ));
const q = exported(seg(iQ, iTPL));
const tpl = exported(seg(iTPL));

fs.mkdirSync("src/data", { recursive: true });

fs.writeFileSync(
  "src/data/plan.js",
  banner("The 7-day plan") +
    head +
    "\n" +
    plan +
    `
/* Derived lookups. The ported literals above are never mutated — the reference
   hung a back-reference off each problem, which would make PLAN cyclic. */
export const PROBS = {};
export const DAY_OF = {};
PLAN.forEach((day) => day.probs.forEach((p) => { PROBS[p.id] = p; DAY_OF[p.id] = day; }));

export const TOTAL = PLAN.reduce((a, d) => a + d.probs.length, 0);
export const DIFFN = { E: "EASY", M: "MED", H: "HARD" };
export const probXP = (p) => p.xp || XPD[p.diff];
`
);

fs.writeFileSync(
  "src/data/meta.js",
  banner("Ranks and badges") +
    ranks +
    "\n" +
    badges +
    `
/* Rank dot colours, cycling the four logo colours up the ladder. */
export const RANKCOL = [
  "var(--blue)", "var(--red)", "var(--yellow)", "var(--green)",
  "var(--blue)", "var(--red)", "var(--yellow)",
];
`
);

fs.writeFileSync(
  "src/data/questions.js",
  banner("The 56-card quiz bank") +
    q +
    `
export const DECKS = [
  { id: "mix", n: "Mix" }, { id: "graphs", n: "Graphs" }, { id: "bt", n: "Backtracking" },
  { id: "dp", n: "DP" }, { id: "ds", n: "Heaps & tries" }, { id: "redo", n: "Redemption" },
];

export const CATN = { pat: "Pattern", bug: "Bug hunt", line: "Missing line", cx: "Complexity" };

export const Q_BY_ID = {};
Q.forEach((q) => { Q_BY_ID[q.id] = q; });
`
);

fs.writeFileSync("src/data/templates.js", banner("Dojo templates") + tpl);

console.log("wrote src/data/{plan,meta,questions,templates}.js");
