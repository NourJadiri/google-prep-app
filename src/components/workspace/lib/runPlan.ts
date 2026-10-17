import type { Spec } from "../../../data/problems";
import { caseFields } from "../../../data/problems";
import type { CaseResult, RunOutcome, RunProgress } from "../../../runner/types";
import type { Verdict } from "./verdict";

/** A case in the Testcase tab. `origin` is the spec test it was copied from; untouched, it runs as that test
 *  (stored expected output and all), edited or added, it runs as a typed-in case answered by the reference. */
export interface CaseDraft {
  key: number;
  origin: number | null;
  fields: Record<string, string>;
}

export type PlanItem = { kind: "test"; test: number } | { kind: "case"; key: number };

export interface RunView {
  id: number;
  mode: "run" | "submit";
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
