import type { CaseResult } from "../../../runner/types";
import { planTestNumber, type RunView } from "../lib/runPlan";
import ResultChip from "./ResultChip";
import "./Chips.css";

interface ResultChipsProps {
  run: RunView;
  results: CaseResult[];
  selected: number;
  onSelect: (k: number) => void;
  label: (r: CaseResult) => string;
  notRun: number;
}

export default function ResultChips({ run, results, selected, onSelect, label, notRun }: ResultChipsProps) {
  const submit = run.mode === "submit";
  return (
    <div className={"ws-chips" + (submit ? " grid" : "")} role="tablist" aria-label="Cases">
      {results.map((r, k) => (
        <ResultChip key={r.i} status={r.status} label={label(r)} selected={k === selected} onSelect={() => onSelect(k)}>
          {submit ? planTestNumber(run, r.i) : label(r)}
        </ResultChip>
      ))}
      {notRun > 0 && <span className="ws-notrun">{notRun} not run</span>}
    </div>
  );
}
