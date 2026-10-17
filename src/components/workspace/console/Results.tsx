import type { Spec } from "../../../data/problems";
import { useSelectedResult } from "../hooks/useSelectedResult";
import { caseLabel } from "../lib/caseLabel";
import { orderLikeCases, type CaseDraft, type RunView } from "../lib/runPlan";
import Block from "./Block";
import CaseDetail from "./CaseDetail";
import ErrorBox from "./ErrorBox";
import ResultChips from "./ResultChips";
import ResultNote from "./ResultNote";
import ResultsEmpty from "./ResultsEmpty";
import ResultsRunning from "./ResultsRunning";
import ValueBox from "./ValueBox";
import VerdictBanner from "./VerdictBanner";

interface ResultsProps {
  spec: Spec;
  cases: CaseDraft[];
  run: RunView | null;
}

export default function Results({ spec, cases, run }: ResultsProps) {
  const [sel, setSel] = useSelectedResult(run);

  if (!run) return <ResultsEmpty />;
  const o = run.outcome;
  if (!o) return <ResultsRunning run={run} />;

  const results = run.mode === "run" ? orderLikeCases(run, cases, o.results) : o.results;
  const chosen = results.find((r) => r.i === sel) ?? results[0];

  return (
    <div className="ws-results">
      {run.verdict && <VerdictBanner verdict={run.verdict} />}

      {o.compileError && <ErrorBox err={o.compileError} />}
      {o.entryError && !run.verdict && <ResultNote>{o.entryError}</ResultNote>}
      {o.stdout && (
        <Block title="Printed while loading">
          <ValueBox>{o.stdout}</ValueBox>
        </Block>
      )}

      {results.length > 0 && (
        <ResultChips
          run={run}
          results={results}
          selected={sel}
          onSelect={setSel}
          label={(r) => caseLabel(spec, run, cases, r.i)}
          notRun={o.total - results.length}
        />
      )}

      {chosen && (
        <CaseDetail
          spec={spec}
          result={chosen}
          title={caseLabel(spec, run, cases, chosen.i)}
          abortMsg={o.aborted?.at === chosen.i ? o.aborted.message : null}
        />
      )}
    </div>
  );
}
