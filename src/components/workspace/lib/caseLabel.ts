import type { Spec } from "../../../data/problems";
import type { CaseDraft, RunView } from "./runPlan";

type Ran =
  | { kind: "unplanned" }
  | { kind: "typed"; key: number }
  | { kind: "example"; test: number }
  | { kind: "test"; test: number };

/** What harness case `i` of a run was: a typed-in case, an untouched example (run mode), or a spec test (submit). */
function ranAs(run: RunView | null, i: number): Ran {
  const p = run?.plan[i];
  if (!p) return { kind: "unplanned" };
  if (p.kind === "case") return { kind: "typed", key: p.key };
  return { kind: run?.mode === "submit" ? "test" : "example", test: p.test };
}

/** The name the results view gives case `i`: "Case 2" after a run, "Test 5 · example" after a submit. */
export function caseLabel(spec: Spec, run: RunView, cases: CaseDraft[], i: number): string {
  const ran = ranAs(run, i);
  switch (ran.kind) {
    case "unplanned":
      return "Case " + (i + 1);
    case "typed":
      return "Case " + (cases.findIndex((c) => c.key === ran.key) + 1);
    case "example":
      return "Case " + (cases.findIndex((c) => c.origin === ran.test) + 1);
    case "test": {
      const t = spec.tests[ran.test];
      return "Test " + (ran.test + 1) + (t?.label ? " · " + t.label : t?.show ? " · example" : "");
    }
  }
}

/** The same case as the paste and the assistant word it: "a case I typed in", "test 5 (label)". */
export function caseLabelForClaude(spec: Spec, run: RunView | null, i: number): string {
  const ran = ranAs(run, i);
  switch (ran.kind) {
    case "unplanned":
    case "typed":
      return "a case I typed in";
    case "example":
      return "an example";
    case "test": {
      const t = spec.tests[ran.test];
      return `test ${ran.test + 1}${t?.label ? ` (${t.label})` : ""}`;
    }
  }
}
