// Slices the reference's data <script> block into typed ES modules, verbatim.
// Run from the repo root: node scripts/extract-data.mjs
//
// The literals are copied byte for byte — the only thing added is a type
// annotation on each `const`, which is why the annotations sit on the binding
// rather than inside the data.
//
// Only templates.ts is still written: plan, meta and questions have all grown
// past the reference by hand (see the note at the bottom). For templates.ts
// the old contract holds — re-run this and `git diff src/data/templates.ts`
// should be empty; a non-empty diff means someone hand-edited ported content.
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

/* plan.ts, meta.ts and questions.ts are deliberately NOT written any more:
   - questions.ts was hand-rebalanced (length-bias removed) and extended far
     past the reference's 56 cards;
   - plan.ts grew a hand-authored second week (d8–d14) past the reference's
     seven days;
   - meta.ts re-worded the two station badges to match the 14-station line.
   Regenerating any of them would silently resurrect the 7-day app. The
   extracted blocks are kept in scope so this note has a body to explain. */
void head; void plan; void ranks; void badges; void q;

fs.writeFileSync("src/data/templates.ts", banner("Dojo templates", "Template") + tpl);

console.log("wrote src/data/templates.ts — plan, meta and questions are hand-authored now, skipped");
