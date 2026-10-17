import { useCallback } from "react";
import type { ProblemContent } from "../../../data/problems";
import { useCopied } from "../../../hooks/useCopied";
import { useLatest } from "../../../hooks/useLatest";
import type { AskContext } from "../../assistant/lib/askContext";
import { claudePrompt, lastRunOf, runReport, sourceOf } from "../lib/claude";
import { withoutLead } from "../lib/markdown";
import type { RunView } from "../lib/runPlan";

const COPIED_FLASH_MS = 2200;

/** The problem, the code and the last run, as the paste for Claude and as the assistant's context for a question. */
export function useClaudeHandoff({ content, code, run }: { content: ProblemContent; code: string; run: RunView | null }) {
  const { spec, statement } = content;
  const [copied, copy] = useCopied(COPIED_FLASH_MS);

  const copyForClaude = () => copy(claudePrompt({ title: spec.title, source: sourceOf(spec), statement, code, last: lastRunOf(spec, run) }));

  const contextNow = (): AskContext => {
    const last = lastRunOf(spec, run);
    return {
      problem: { title: spec.title, source: sourceOf(spec), statement: withoutLead(statement).trim() },
      code,
      run: last ? runReport(last) : null,
    };
  };
  const contextRef = useLatest(contextNow);
  /* Read when a question is sent, and never changes identity, so the assistant's memoised props hold still while you type. */
  const readContext = useCallback(() => contextRef.current(), []);

  return { copied, copyForClaude, readContext };
}
