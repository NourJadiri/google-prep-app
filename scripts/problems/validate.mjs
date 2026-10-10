/* Validates the problem bank: every problem's reference solution is run
 * through the real harness (src/runner/harness.py) in the real interpreter
 * (Pyodide from node_modules — the very build the browser loads), so a
 * problem that validates here behaves identically in the app.
 *
 *   node scripts/problems/validate.mjs              # everything
 *   node scripts/problems/validate.mjs two-sum ...  # just these
 *   node scripts/problems/validate.mjs --json       # machine-readable
 *
 * Checks, per problem directory under src/data/problems/:
 *   - the four required files exist; spec.json is well-formed
 *   - statement.md and notes.md carry their required sections
 *   - solution.py passes every test, each inside a third of its time limit
 *   - the starter code does NOT pass (so the tests can tell)
 *   - brute.py, when present, passes every non-perf test (two independent
 *     implementations agreeing is what makes an expected value trustworthy)
 *   - wrong.py, when present, FAILS at least one test
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPyodide } from "pyodide";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const BANK = path.join(ROOT, "src/data/problems");
const HARNESS = fs.readFileSync(path.join(ROOT, "src/runner/harness.py"), "utf8");
const DEFAULT_LIMIT_MS = 4000;

const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const wanted = argv.filter((a) => !a.startsWith("--"));

const ids = wanted.length
  ? wanted
  : fs.readdirSync(BANK).filter((d) => fs.statSync(path.join(BANK, d)).isDirectory()).sort();

const py = await loadPyodide({ stdout: () => {}, stderr: () => {} });
py.FS.writeFile("/home/pyodide/harness.py", HARNESS);
const harnessRun = py.pyimport("harness").run;

function runPy(request) {
  const events = [];
  const out = harnessRun(JSON.stringify(request), (s) => events.push(s));
  return JSON.parse(String(out));
}

const read = (dir, f) => {
  const p = path.join(dir, f);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
};

const KINDS = new Set(["function", "design"]);
const COMPARE = new Set(["exact", "unordered", "unordered-deep"]);
const TYPES = new Set(["ListNode", "TreeNode", "ListNode[]", "TreeNode[]"]);
const DIFFS = new Set(["E", "M", "H"]);

function hasSection(md, title) {
  return md.split("\n").some((l) => l.trim().toLowerCase().startsWith("## " + title.toLowerCase()));
}

function checkSpec(spec, id, errors, warnings) {
  const need = (cond, msg) => {
    if (!cond) errors.push(msg);
  };
  need(spec.id === id, `spec.id "${spec.id}" must equal the directory name "${id}"`);
  need(typeof spec.title === "string" && spec.title.length > 0, "spec.title is required");
  need(DIFFS.has(spec.difficulty), "spec.difficulty must be E, M or H");
  need(KINDS.has(spec.kind), "spec.kind must be function or design");
  need(typeof spec.starter === "string" && spec.starter.trim().length > 0, "spec.starter is required");
  if (spec.kind === "function") {
    need(typeof spec.entry === "string", "function problems need spec.entry (the Solution method name)");
    need(Array.isArray(spec.params) && spec.params.length > 0, "function problems need spec.params");
    for (const p of spec.params ?? []) {
      need(typeof p.name === "string", "every param needs a name");
      if (p.type !== undefined) need(TYPES.has(p.type), `unknown param type ${p.type}`);
    }
    if (spec.returns !== undefined) need(TYPES.has(spec.returns), `unknown return type ${spec.returns}`);
    if (spec.compare !== undefined) need(COMPARE.has(spec.compare), `unknown compare mode ${spec.compare}`);
    if (spec.mutates !== undefined)
      need((spec.params ?? []).some((p) => p.name === spec.mutates), "spec.mutates must name a param");
    if (typeof spec.starter === "string" && typeof spec.entry === "string") {
      need(spec.starter.includes("class Solution"), "the starter must define class Solution");
      need(spec.starter.includes(`def ${spec.entry}(self`), `the starter must define def ${spec.entry}(self, ...)`);
    }
  } else if (spec.kind === "design") {
    need(typeof spec.className === "string", "design problems need spec.className");
    if (typeof spec.starter === "string" && typeof spec.className === "string")
      need(spec.starter.includes(`class ${spec.className}`), `the starter must define class ${spec.className}`);
  }
  need(Array.isArray(spec.tests), "spec.tests must be an array");
  const tests = spec.tests ?? [];
  if (tests.length < 10) warnings.push(`only ${tests.length} tests — aim for 15 or more`);
  const shown = tests.filter((t) => t.show);
  need(shown.length >= 2 && shown.length <= 4, `2–4 tests should be marked show:true (found ${shown.length})`);
  tests.forEach((t, k) => {
    need("expected" in t, `test ${k} has no expected value`);
    if (spec.kind === "design") {
      need(("ops" in t && "args" in t) || "argsPy" in t, `test ${k} needs ops+args or argsPy`);
      if ("ops" in t) need(Array.isArray(t.ops) && Array.isArray(t.args) && t.ops.length === t.args.length, `test ${k}: ops and args must be equal-length arrays`);
    } else {
      need("args" in t || "argsPy" in t, `test ${k} needs args or argsPy`);
      if ("args" in t) need(Array.isArray(t.args) && t.args.length === (spec.params ?? []).length, `test ${k}: args must have one entry per param`);
    }
    if (t.show) need(!("argsPy" in t), `test ${k} is shown, so it must use literal args`);
    if (t.timeLimitMs !== undefined) need(typeof t.timeLimitMs === "number", `test ${k}: timeLimitMs must be a number`);
  });
  const size = JSON.stringify(spec).length;
  if (size > 400_000) errors.push(`spec.json is ${Math.round(size / 1000)} KB — move big inputs to argsPy`);
  else if (size > 150_000) warnings.push(`spec.json is ${Math.round(size / 1000)} KB — consider argsPy for big inputs`);
}

const report = [];
let failed = 0;

for (const id of ids) {
  const dir = path.join(BANK, id);
  const errors = [];
  const warnings = [];
  const row = { id, tests: 0, maxMs: 0, errors, warnings };
  report.push(row);

  if (!fs.existsSync(dir)) {
    errors.push("no such problem directory");
    failed++;
    continue;
  }
  const specText = read(dir, "spec.json");
  const statement = read(dir, "statement.md");
  const solution = read(dir, "solution.py");
  const notes = read(dir, "notes.md");
  const judge = read(dir, "judge.py");
  const brute = read(dir, "brute.py");
  const wrong = read(dir, "wrong.py");
  for (const [f, v] of [["spec.json", specText], ["statement.md", statement], ["solution.py", solution], ["notes.md", notes]]) {
    if (v === null) errors.push(`missing ${f}`);
  }
  if (errors.length) {
    failed++;
    continue;
  }

  let spec;
  try {
    spec = JSON.parse(specText);
  } catch (e) {
    errors.push("spec.json does not parse: " + e.message);
    failed++;
    continue;
  }
  checkSpec(spec, id, errors, warnings);
  for (const s of ["The task", "Examples", "Constraints"]) {
    if (!hasSection(statement, s)) errors.push(`statement.md needs a "## ${s}" section`);
  }
  if (!statement.startsWith("# ")) errors.push("statement.md must open with a '# Title' line");
  for (const s of ["Approach", "Complexity"]) {
    if (!hasSection(notes, s)) errors.push(`notes.md needs a "## ${s}" section`);
  }
  if (errors.length) {
    failed++;
    continue;
  }

  const tests = spec.tests;
  row.tests = tests.length;
  const all = tests.map((_, k) => k);
  const base = { spec: specText, custom: [], ...(judge ? { judge } : {}) };

  // 1. The reference passes everything, comfortably inside the limits.
  const ref = runPy({ ...base, code: solution, select: all });
  if (ref.compileError) errors.push("solution.py: " + ref.compileError.message);
  else if (ref.entryError) errors.push("solution.py: " + ref.entryError);
  else {
    for (const r of ref.results) {
      const t = tests[r.i];
      const limit = t.timeLimitMs ?? spec.timeLimitMs ?? DEFAULT_LIMIT_MS;
      row.maxMs = Math.max(row.maxMs, r.ms);
      if (r.status !== "pass") {
        const why = r.error ? r.error.message : r.message ?? `got ${r.got}, expected ${r.expected}`;
        errors.push(`solution.py fails test ${r.i} (${r.status}): ${why}`.slice(0, 400));
      } else if (r.ms > limit / 3) {
        errors.push(`solution.py takes ${r.ms} ms on test ${r.i} — over a third of its ${limit} ms limit`);
      } else if (r.ms > 600) {
        warnings.push(`solution.py takes ${r.ms} ms on test ${r.i}`);
      }
    }
    if (ref.results.length !== tests.length) errors.push(`only ${ref.results.length} of ${tests.length} tests ran`);
  }

  // 2. The starter must not pass — otherwise the tests can't tell anything.
  const starter = runPy({ ...base, code: spec.starter, select: all });
  if (starter.compileError) errors.push("the starter doesn't compile: " + starter.compileError.message);
  else if (starter.entryError) errors.push("the starter: " + starter.entryError);
  else if (starter.results.every((r) => r.status === "pass")) errors.push("the starter code passes every test");

  // 3. An independent brute force agrees on every test small enough for it.
  if (brute) {
    const small = tests.map((t, k) => (t.perf ? -1 : k)).filter((k) => k >= 0);
    const b = runPy({ ...base, code: brute, select: small });
    if (b.compileError || b.entryError) errors.push("brute.py: " + (b.compileError?.message ?? b.entryError));
    else
      for (const r of b.results) {
        if (r.status !== "pass") {
          const why = r.error ? r.error.message : `got ${r.got}, expected ${r.expected}`;
          errors.push(`brute.py disagrees on test ${small[r.i]}: ${why}`.slice(0, 400));
        }
      }
  } else {
    warnings.push("no brute.py — expected values are checked by one implementation only");
  }

  // 4. A plausible wrong answer must be caught.
  if (wrong) {
    const w = runPy({ ...base, code: wrong, select: all });
    if (!w.compileError && !w.entryError && w.results.every((r) => r.status === "pass"))
      errors.push("wrong.py passes every test — the tests miss that bug");
  }

  // 5. Custom cases: the first shown test, typed back in, reproduces itself.
  const shownIdx = tests.findIndex((t) => t.show);
  if (shownIdx >= 0 && errors.length === 0) {
    const t = tests[shownIdx];
    const names = spec.kind === "design" ? ["ops", "args"] : spec.params.map((p) => p.name);
    const values = spec.kind === "design" ? [t.ops, t.args] : t.args;
    const fields = Object.fromEntries(names.map((n, k) => [n, JSON.stringify(values[k])]));
    const c = runPy({ ...base, code: solution, select: [], custom: [fields], reference: solution });
    const r = c.results[0];
    if (!r || r.status !== "pass") errors.push(`a typed-in copy of test ${shownIdx} doesn't round-trip (${r ? r.status : "no result"})`);
  }

  if (errors.length) failed++;
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  for (const r of report) {
    const mark = r.errors.length ? "FAIL" : "ok  ";
    console.log(`${mark} ${r.id.padEnd(46)} ${String(r.tests).padStart(3)} tests  ref max ${String(r.maxMs).padStart(6)} ms`);
    for (const e of r.errors) console.log(`       ✗ ${e}`);
    for (const w of r.warnings) console.log(`       · ${w}`);
  }
  console.log(`\n${report.length - failed}/${report.length} problems valid`);
}
process.exit(failed ? 1 : 0);
