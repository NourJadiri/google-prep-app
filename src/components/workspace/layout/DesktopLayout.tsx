import type { ReactNode } from "react";
import Split from "../Split";
import "./DesktopLayout.css";

interface DesktopLayoutProps {
  splitX: number;
  splitY: number;
  onSplitX: (ratio: number) => void;
  onSplitY: (ratio: number) => void;
  /** A drag or key nudge has settled. */
  onCommitSplits: () => void;
  problem: ReactNode;
  editor: ReactNode;
  tests: ReactNode;
  assistant: ReactNode;
}

export default function DesktopLayout({ splitX, splitY, onSplitX, onSplitY, onCommitSplits, problem, editor, tests, assistant }: DesktopLayoutProps) {
  return (
    <>
      <div className="ws-main">
        <Split dir="row" ratio={splitX} onRatio={onSplitX} onCommit={onCommitSplits} label="Resize the statement">
          {problem}
          <Split dir="col" ratio={splitY} onRatio={onSplitY} onCommit={onCommitSplits} min={0.25} max={0.85} label="Resize the editor">
            {editor}
            {tests}
          </Split>
        </Split>
      </div>
      {assistant}
    </>
  );
}
