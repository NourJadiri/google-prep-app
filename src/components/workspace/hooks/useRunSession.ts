import { useRef, useState } from "react";
import type { ProblemContent } from "../../../data/problems";
import * as runner from "../../../runner/runner";
import { useApp } from "../../../state/AppState";
import { planRun, type CaseDraft, type RunMode, type RunView } from "../lib/runPlan";
import { verdictOf } from "../lib/verdict";

let runSeq = 0;

interface RunSessionOptions {
  pid: string;
  content: ProblemContent;
  code: string;
  cases: CaseDraft[];
  /** Called as a run is sent: the caller saves the draft and brings the results into view. */
  onStart: () => void;
}

/** Sends the code to the runner and follows the run. A submit where every test passes accepts the problem. */
export function useRunSession({ pid, content, code, cases, onStart }: RunSessionOptions) {
  const { actions } = useApp();
  const [run, setRun] = useState<RunView | null>(null);
  const busy = run !== null && run.outcome === null;
  /* A single key press reaches both the editor's keymap and the window listener before React re-renders, so state alone can't guard re-entry. */
  const inFlight = useRef(false);

  async function execute(mode: RunMode) {
    if (inFlight.current) return;
    inFlight.current = true;
    const { request, plan } = planRun(content, code, mode, cases);
    const id = ++runSeq;
    setRun({ id, mode, plan, progress: null, outcome: null, verdict: null });
    onStart();

    const outcome = await runner.run(request, (p) =>
      setRun((cur) => (cur && cur.id === id && !cur.outcome ? { ...cur, progress: p } : cur))
    );
    inFlight.current = false;
    const verdict = verdictOf(outcome, mode);
    setRun((cur) => (cur && cur.id === id ? { ...cur, outcome, verdict, progress: null } : cur));
    if (mode === "submit" && verdict.tone === "ok") actions.accept(pid);
  }

  const start = (mode: RunMode) => void execute(mode);

  return { run, busy, start, stop: runner.stop };
}
