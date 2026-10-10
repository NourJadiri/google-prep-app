// The problem bank, loaded on demand. Each problem's files are separate lazy
// chunks: opening a workspace fetches its statement, spec, reference, notes
// and judge, and nothing else ever does. brute.py and wrong.py exist for the
// validator only and never reach the bundle — nothing here globs them.
//
// spec.json crosses into the app as raw text and is handed to the harness
// verbatim (see src/runner/types.ts); the parsed copy here only drives the
// UI — the shown examples, the parameter names, the starter.

type Loader = () => Promise<string>;

const SPECS = import.meta.glob<string>("./*/spec.json", { query: "?raw", import: "default" });
const STATEMENTS = import.meta.glob<string>("./*/statement.md", { query: "?raw", import: "default" });
const SOLUTIONS = import.meta.glob<string>("./*/solution.py", { query: "?raw", import: "default" });
const NOTES = import.meta.glob<string>("./*/notes.md", { query: "?raw", import: "default" });
const JUDGES = import.meta.glob<string>("./*/judge.py", { query: "?raw", import: "default" });

const key = (id: string, file: string) => `./${id}/${file}`;

/** Whether the bank has a runnable problem under this id — known at build
 *  time, so rows can decide between the workspace and LeetCode synchronously. */
export const hasProblem = (id: string | null | undefined): id is string =>
  !!id && key(id, "spec.json") in SPECS && key(id, "statement.md") in STATEMENTS;

export type ParamType = "ListNode" | "TreeNode" | "ListNode[]" | "TreeNode[]";

export interface SpecTest {
  args?: unknown[];
  argsPy?: string;
  ops?: string[];
  expected?: unknown;
  show?: boolean;
  label?: string;
  perf?: boolean;
  timeLimitMs?: number;
}

export interface Spec {
  id: string;
  title: string;
  difficulty: "E" | "M" | "H";
  lc?: { num?: number; slug?: string; premium?: boolean };
  topics?: string[];
  kind: "function" | "design";
  entry?: string;
  className?: string;
  params?: Array<{ name: string; type?: ParamType }>;
  returns?: ParamType;
  mutates?: string;
  compare?: "exact" | "unordered" | "unordered-deep";
  timeLimitMs?: number;
  starter: string;
  tests: SpecTest[];
}

export interface ProblemContent {
  id: string;
  /** spec.json exactly as written — what the harness gets. */
  specText: string;
  spec: Spec;
  statement: string;
  solution: string;
  notes: string;
  judge: string | null;
}

const cache = new Map<string, Promise<ProblemContent | null>>();

async function fetchProblem(id: string): Promise<ProblemContent | null> {
  const spec = SPECS[key(id, "spec.json")];
  const statement = STATEMENTS[key(id, "statement.md")];
  if (!spec || !statement) return null;
  const opt = (m: Record<string, Loader>, f: string) => m[key(id, f)]?.() ?? Promise.resolve(null);
  const [specText, st, solution, notes, judge] = await Promise.all([
    spec(),
    statement(),
    opt(SOLUTIONS, "solution.py"),
    opt(NOTES, "notes.md"),
    opt(JUDGES, "judge.py"),
  ]);
  return {
    id,
    specText,
    spec: JSON.parse(specText) as Spec,
    statement: st,
    solution: solution ?? "",
    notes: notes ?? "",
    judge,
  };
}

/** One problem, loaded once per session (a failed load is retried). */
export function loadProblem(id: string): Promise<ProblemContent | null> {
  let p = cache.get(id);
  if (!p) {
    p = fetchProblem(id).catch(() => {
      cache.delete(id);
      return null;
    });
    cache.set(id, p);
  }
  return p;
}

/** The parameter names a typed-in case is keyed by. */
export const fieldNames = (spec: Spec): string[] =>
  spec.kind === "design" ? ["ops", "args"] : (spec.params ?? []).map((p) => p.name);

/** A shown test's values, one per field, as the Testcase tab prints them. */
export function caseFields(spec: Spec, t: SpecTest): Record<string, string> {
  const names = fieldNames(spec);
  const values = spec.kind === "design" ? [t.ops ?? [], t.args ?? []] : (t.args ?? []);
  return Object.fromEntries(names.map((n, i) => [n, JSON.stringify(values[i] ?? null)]));
}
