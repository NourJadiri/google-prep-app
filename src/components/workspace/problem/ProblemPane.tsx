import type { ProblemContent } from "../../../data/problems";
import { useCopied } from "../../../hooks/useCopied";
import Tab from "../../ui/Tab";
import Tabs from "../../ui/Tabs";
import ReferenceSolution from "./ReferenceSolution";
import SolutionVeil from "./SolutionVeil";
import Statement from "./Statement";
import "./ProblemPane.css";

interface ProblemPaneProps {
  content: ProblemContent;
  tab: "desc" | "solution";
  onTab: (t: "desc" | "solution") => void;
  /** Passed every test at some point: the solution is open. */
  accepted: boolean;
  revealed: boolean;
  onReveal: () => void;
  fontSize: number;
}

export default function ProblemPane({ content, tab, onTab, accepted, revealed, onReveal, fontSize }: ProblemPaneProps) {
  /* Held here, not in the solution, so the flash survives a trip to the other tab. */
  const [copied, copy] = useCopied(1800);
  const open = accepted || revealed;

  return (
    <section className="ws-problem" aria-label="Problem">
      <Tabs>
        <Tab icon="file-text" selected={tab === "desc"} onSelect={() => onTab("desc")}>
          Description
        </Tab>
        <Tab icon={open ? "book-open" : "lock"} selected={tab === "solution"} onSelect={() => onTab("solution")}>
          Solution
        </Tab>
      </Tabs>

      <div className="ws-problem-body">
        {tab === "desc" ? (
          <Statement statement={content.statement} topics={content.spec.topics ?? []} />
        ) : !open ? (
          <SolutionVeil onReveal={onReveal} />
        ) : (
          <ReferenceSolution content={content} fontSize={fontSize} copied={copied} onCopy={() => copy(content.solution)} />
        )}
      </div>
    </section>
  );
}
