// Slices the reference's data <script> block into typed ES modules, verbatim.
// Run from the repo root: node scripts/extract-data.mjs
//
// The literals are copied byte for byte — the only thing added is a type
// annotation on each `const`, which is why the annotations sit on the binding
// rather than inside the data.
//
// This script is the only thing keeping src/data honest against the reference:
// re-run it and `git diff src/data` should be empty. A non-empty diff means
// someone hand-edited the ported content.
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

/* Type for each ported binding. Annotating the binding contextually types the
   literal underneath it, so `diff:"M"` narrows to Diff and `ph:"graphs"` to
   Phase without a single character of the reference's data being rewritten.
   PLAN and RANKS are non-empty tuples so index 0 needs no undefined check. */
const TYPES = {
  LC: "(slug: string) => string",
  XPD: "Record<Diff, number>",
  RITUAL_XP: "number",
  PLAN: "NonEmpty<Day>",
  RANKS: "NonEmpty<Rank>",
  BADGES: "Badge[]",
  Q: "Question[]",
  TPL: "Template[]",
};

/* `const NAME =` -> `export const NAME: Type =`, leaving the value untouched. */
const exported = (s) =>
  s.replace(/^const (\w+)( *)=/gm, (line, name, gap) => {
    const t = TYPES[name];
    if (!t) throw new Error("no type declared for exported const: " + name);
    return `export const ${name}: ${t}${gap}=`;
  });

const banner = (what, types) =>
  `// ${what} — ported verbatim from reference/onsite-express.html.\n` +
  `// Content is ground truth: do not rewrite, reword or reorder.\n` +
  `// Regenerate with: node scripts/extract-data.mjs\n\n` +
  `import type { ${types} } from "../types";\n\n`;

const head = exported(seg(iLC, iPLAN));
const plan = exported(seg(iPLAN, iRANKS));
const ranks = exported(seg(iRANKS, iBADGES));
const badges = exported(seg(iBADGES, iQ));
const q = exported(seg(iQ, iTPL));
const tpl = exported(seg(iTPL));

fs.mkdirSync("src/data", { recursive: true });

fs.writeFileSync(
  "src/data/plan.ts",
  banner("The 7-day plan", "Day, Diff, NonEmpty, Problem") +
    head +
    "\n" +
    plan +
    `
/* Derived lookups. The ported literals above are never mutated — the reference
   hung a back-reference off each problem, which would make PLAN cyclic.

   Keyed by string rather than a union of the 28 known ids on purpose: these are
   read with ids off the persisted blob, which a stale export can populate with
   anything. Under noUncheckedIndexedAccess every lookup therefore has to admit
   it can miss, which is exactly the check a stale id needs. */
export const PROBS: Record<string, Problem> = {};
export const DAY_OF: Record<string, Day> = {};
PLAN.forEach((day) => day.probs.forEach((p) => { PROBS[p.id] = p; DAY_OF[p.id] = day; }));

export const TOTAL: number = PLAN.reduce((a, d) => a + d.probs.length, 0);
export const DIFFN: Record<Diff, string> = { E: "EASY", M: "MED", H: "HARD" };
export const probXP = (p: Problem): number => p.xp || XPD[p.diff];

/* Where a problem's \u2197 goes. Every problem in the reference carries a slug or a
   url \u2014 only the Day-7 mock uses the latter \u2014 so the "" is unreachable. */
export const probURL = (p: Problem): string => p.url ?? (p.slug ? LC(p.slug) : "");
`
);

fs.writeFileSync(
  "src/data/meta.ts",
  banner("Ranks and badges", "Badge, NonEmpty, Rank") +
    ranks +
    "\n" +
    badges +
    `
/* Rank dot colours, cycling the four logo colours up the ladder. */
export const RANKCOL: string[] = [
  "var(--blue)", "var(--red)", "var(--yellow)", "var(--green)",
  "var(--blue)", "var(--red)", "var(--yellow)",
];
`
);

fs.writeFileSync(
  "src/data/questions.ts",
  banner("The 56-card quiz bank", "Deck, QType, Question") +
    q +
    `
export const DECKS: Deck[] = [
  { id: "mix", n: "Mix" }, { id: "graphs", n: "Graphs" }, { id: "bt", n: "Backtracking" },
  { id: "dp", n: "DP" }, { id: "ds", n: "Heaps & tries" }, { id: "redo", n: "Redemption" },
];

export const CATN: Record<QType, string> = { pat: "Pattern", bug: "Bug hunt", line: "Missing line", cx: "Complexity" };

export const Q_BY_ID: Record<string, Question> = {};
Q.forEach((q) => { Q_BY_ID[q.id] = q; });
`
);

fs.writeFileSync("src/data/templates.ts", banner("Dojo templates", "Template") + tpl);

console.log("wrote src/data/{plan,meta,questions,templates}.ts");
