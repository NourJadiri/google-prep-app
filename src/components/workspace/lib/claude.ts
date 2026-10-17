import type { Spec } from "../../../data/problems";
import type { CaseResult } from "../../../runner/types";
import { caseLabelForClaude } from "./caseLabel";
import { withoutLead } from "./markdown";
import type { RunView } from "./runPlan";
import type { Verdict } from "./verdict";

export interface ClaudeInput {
  title: string;
  /** "LeetCode 1", "stands in for LeetCode 253, premium" or "original". */
  source: string;
  statement: string;
  code: string;
  last: { verdict: Verdict; focus: CaseResult | null; label: string | null } | null;
}

export function sourceOf(spec: Spec): string {
  const lc = spec.lc;
  if (!lc?.num) return "original";
  return lc.premium ? `stands in for LeetCode ${lc.num}, premium` : `LeetCode ${lc.num}`;
}

/** The finished run's verdict and the case it points at, or null before one has finished. */
export function lastRunOf(spec: Spec, run: RunView | null): ClaudeInput["last"] {
  if (!run?.verdict) return null;
  const verdict = run.verdict;
  const focus = run.outcome?.results[verdict.focus] ?? null;
  return { verdict, focus, label: focus ? caseLabelForClaude(spec, run, focus.i) : null };
}

const indent = (lines: string[]) => lines.map((l) => "    " + l).join("\n");

/** What the last run said, failing case and all: the paste ends with it, and the assistant's questions carry it. */
export function runReport(last: NonNullable<ClaudeInput["last"]>): string {
  const parts = [`## Last run: ${last.verdict.title}`, "", last.verdict.detail];
  const r = last.focus;
  if (r && r.status !== "pass") {
    parts.push("", `On ${last.label ?? "this case"}:`, "", "Input:", indent(r.input));
    if (r.got !== undefined) parts.push("Output:", indent([r.got]));
    if (r.expected !== undefined) parts.push("Expected:", indent([r.expected]));
    if (r.message) parts.push(r.message);
    if (r.error) parts.push("Error:", indent(r.error.traceback.split("\n")));
    if (r.stdout) parts.push("Printed:", indent(r.stdout.trimEnd().split("\n").slice(0, 30)));
  }
  return parts.join("\n");
}

export function claudePrompt({ title, source, statement, code, last }: ClaudeInput): string {
  const parts = [`# ${title} (${source})`, "", withoutLead(statement).trim(), "", "## My code so far", "", "```python", code.trimEnd(), "```"];

  if (last) parts.push("", runReport(last));

  parts.push(
    "",
    "---",
    "*Be my interviewer for this one. Don't hand me a solution: have me talk through my approach and its complexity first, point at a bug with a question before an answer, and give a hint only when I ask for one.*"
  );
  return parts.join("\n");
}
