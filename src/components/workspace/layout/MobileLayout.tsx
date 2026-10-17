import type { ReactNode } from "react";
import { cx } from "../../../lib/cx";
import Segment from "../../ui/Segment";
import SegmentedControl from "../../ui/SegmentedControl";
import StatusDot from "../../ui/StatusDot";
import type { Verdict } from "../lib/verdict";
import "./MobileLayout.css";

export type MobileTab = "problem" | "code" | "tests";

const TABS: Array<{ id: MobileTab; label: string }> = [
  { id: "problem", label: "Problem" },
  { id: "code", label: "Code" },
  { id: "tests", label: "Tests" },
];

interface MobileLayoutProps {
  tab: MobileTab;
  onTab: (tab: MobileTab) => void;
  /** A run is in flight, or the last one's verdict: the dot on the Tests segment. */
  busy: boolean;
  verdict: Verdict | null;
  problem: ReactNode;
  editor: ReactNode;
  tests: ReactNode;
  assistant: ReactNode;
}

export default function MobileLayout({ tab, onTab, busy, verdict, problem, editor, tests, assistant }: MobileLayoutProps) {
  const testsDot = busy ? <StatusDot tone="pulse" /> : verdict && <StatusDot tone={verdict.tone} />;

  return (
    <>
      <SegmentedControl aria-label="Workspace panes">
        {TABS.map(({ id, label }) => (
          <Segment key={id} selected={tab === id} onSelect={() => onTab(id)}>
            {label}
            {id === "tests" && testsDot}
          </Segment>
        ))}
      </SegmentedControl>
      {/* All three stay mounted, so switching panes keeps the editor's undo history and the statement's scroll position. */}
      <div className="ws-stack">
        <div className={cx("ws-pane", tab === "problem" && "on")}>{problem}</div>
        <div className={cx("ws-pane", tab === "code" && "on")}>{editor}</div>
        <div className={cx("ws-pane", tab === "tests" && "on")}>{tests}</div>
      </div>
      {assistant}
    </>
  );
}
