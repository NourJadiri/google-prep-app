/* "Copy for Claude": the problem, your code, and what the last run said, as
   one paste — with the instruction that makes Claude an interviewer rather
   than an answer key. The drills used to carry that instruction as their
   footer; it lives here now, so every problem gets it. */

import type { CaseResult } from "../../runner/types";
import type { Verdict } from "./verdict";
import { withoutLead } from "./Markdown";

export interface ClaudeInput {
  title: string;
  /** "LeetCode 1" or "stands in for LeetCode 253 (premium)". */
  source: string;
  statement: string;
  code: string;
  last: { verdict: Verdict; focus: CaseResult | null; label: string | null } | null;
}

const indent = (lines: string[]) => lines.map((l) => "    " + l).join("\n");

export function claudePrompt({ title, source, statement, code, last }: ClaudeInput): string {
  const parts = [`# ${title} (${source})`, "", withoutLead(statement).trim(), "", "## My code so far", "", "```python", code.trimEnd(), "```"];

  if (last) {
    parts.push("", `## Last run: ${last.verdict.title}`, "", last.verdict.detail);
    const r = last.focus;
    if (r && r.status !== "pass") {
      parts.push("", `On ${last.label ?? "this case"}:`, "", "Input:", indent(r.input));
      if (r.got !== undefined) parts.push("Output:", indent([r.got]));
      if (r.expected !== undefined) parts.push("Expected:", indent([r.expected]));
      if (r.message) parts.push(r.message);
      if (r.error) parts.push("Error:", indent(r.error.traceback.split("\n")));
      if (r.stdout) parts.push("Printed:", indent(r.stdout.trimEnd().split("\n").slice(0, 30)));
    }
  }

  parts.push(
    "",
    "---",
    "*Be my interviewer for this one. Don't hand me a solution: have me talk through my approach and its complexity first, point at a bug with a question before an answer, and give a hint only when I ask for one.*"
  );
  return parts.join("\n");
}
