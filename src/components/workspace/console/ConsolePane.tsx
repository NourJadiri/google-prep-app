import type { Spec } from "../../../data/problems";
import type { CaseDraft, RunView } from "../lib/runPlan";
import StatusDot from "../../ui/StatusDot";
import Tab from "../../ui/Tab";
import Tabs from "../../ui/Tabs";
import CaseEditor from "./CaseEditor";
import Results from "./Results";
import "./ConsolePane.css";

interface ConsolePaneProps {
  spec: Spec;
  cases: CaseDraft[];
  onCases: (cs: CaseDraft[]) => void;
  activeCase: number;
  onActiveCase: (i: number) => void;
  tab: "cases" | "result";
  onTab: (t: "cases" | "result") => void;
  run: RunView | null;
}

export default function ConsolePane({ spec, cases, onCases, activeCase, onActiveCase, tab, onTab, run }: ConsolePaneProps) {
  const running = run !== null && run.outcome === null;
  const resultDot = running ? <StatusDot tone="pulse" aria-label="running" /> : run?.verdict && <StatusDot tone={run.verdict.tone} aria-hidden="true" />;

  return (
    <section className="ws-console" aria-label="Tests">
      <Tabs>
        <Tab icon="list-checks" selected={tab === "cases"} onSelect={() => onTab("cases")}>
          Testcase
        </Tab>
        <Tab icon="terminal" selected={tab === "result"} onSelect={() => onTab("result")} status={resultDot}>
          Result
        </Tab>
      </Tabs>

      <div className="ws-console-body">
        {tab === "cases" ? (
          <CaseEditor spec={spec} cases={cases} onCases={onCases} activeCase={activeCase} onActiveCase={onActiveCase} />
        ) : (
          <Results spec={spec} cases={cases} run={run} />
        )}
      </div>
    </section>
  );
}
