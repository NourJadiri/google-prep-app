import type { ProblemContent, Spec } from "../../../data/problems";
import { caseFields } from "../../../data/problems";
import type { CaseResult, RunOutcome, RunProgress, RunRequest } from "../../../runner/types";
import type { Verdict } from "./verdict";

/** A case in the Testcase tab. `origin` is the spec test it was copied from; untouched, it runs as that test
 *  (stored expected output and all), edited or added, it runs as a typed-in case answered by the reference. */
export interface CaseDraft {
  key: number;
  origin: number | null;
  fields: Record<string, string>;
}

export type PlanItem = { kind: "test"; test: number } | { kind: "case"; key: number };

export type RunMode = "run" | "submit";

export interface RunView {
  id: number;
  mode: RunMode;
  /** What each harness case index was, in harness order. */
  plan: PlanItem[];
  progress: RunProgress | null;
  outcome: RunOutcome | null;
  verdict: Verdict | null;
}

/** The spec's shown examples, as the Testcase tab starts out. */
export const defaultCases = (spec: Spec): CaseDraft[] =>
  spec.tests
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.show)
    .map(({ t, i }, k) => ({ key: k + 1, origin: i, fields: caseFields(spec, t) }));

export const isEdited = (spec: Spec, c: CaseDraft): boolean => {
  if (c.origin === null) return true;
  const t = spec.tests[c.origin];
  if (!t) return true;
  const orig = caseFields(spec, t);
  return Object.keys(orig).some((k) => (c.fields[k] ?? "").trim() !== (orig[k] ?? "").trim());
};

/** What a run sends, and what each harness case will be. A submit is every spec test. A run is the Testcase tab's
 *  cases: untouched examples as their spec tests first, then the typed-in ones, which the reference answers. */
export function planRun(content: ProblemContent, code: string, mode: RunMode, cases: CaseDraft[]): { request: RunRequest; plan: PlanItem[] } {
  const spec = content.spec;
  const select: number[] = [];
  const custom: Array<Record<string, string>> = [];
  const plan: PlanItem[] = [];
  if (mode === "submit") {
    spec.tests.forEach((_, i) => {
      select.push(i);
      plan.push({ kind: "test", test: i });
    });
  } else {
    const typed: PlanItem[] = [];
    for (const c of cases) {
      if (c.origin !== null && !isEdited(spec, c)) {
        select.push(c.origin);
        plan.push({ kind: "test", test: c.origin });
      } else {
        custom.push(c.fields);
        typed.push({ kind: "case", key: c.key });
      }
    }
    plan.push(...typed);
  }
  const request: RunRequest = {
    spec: content.specText,
    code,
    select,
    custom,
    ...(content.judge ? { judge: content.judge } : {}),
    ...(custom.length ? { reference: content.solution } : {}),
  };
  return { request, plan };
}

/** The line to mark in the editor: the compile error's, else the first case that blamed one. */
export const errorLineOf = (run: RunView | null): number | null =>
  run?.outcome?.compileError?.line ?? run?.outcome?.results.find((x) => x.error?.line)?.error?.line ?? null;

/** Run-mode results arrive spec tests first, then typed-in ones; the chips read in the Testcase tab's order. */
export function orderLikeCases(run: RunView, cases: CaseDraft[], results: CaseResult[]): CaseResult[] {
  const resultFor = (c: CaseDraft) =>
    results.find((r) => {
      const p = run.plan[r.i];
      return p !== undefined && (p.kind === "case" ? p.key === c.key : c.origin === p.test);
    });
  const ordered = cases.map(resultFor).filter((r): r is CaseResult => !!r);
  return ordered.length === results.length ? ordered : results;
}

export function planTestNumber(run: RunView, i: number): string {
  const p = run.plan[i];
  return p && p.kind === "test" ? String(p.test + 1) : String(i + 1);
}
