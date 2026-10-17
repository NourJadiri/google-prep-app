import type { ReactNode } from "react";
import type { CaseResult } from "../../../runner/types";
import { caseMark } from "../lib/verdict";
import "./Chips.css";

interface ResultChipProps {
  status: CaseResult["status"];
  /** The case's full name, for the tooltip. */
  label: string;
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}

export default function ResultChip({ status, label, selected, onSelect, children }: ResultChipProps) {
  const mark = caseMark(status);
  return (
    <button
      role="tab"
      aria-selected={selected}
      className={"ws-chip mark " + mark.tone + (selected ? " on" : "")}
      onClick={onSelect}
      title={label + " — " + mark.word}
    >
      {children}
    </button>
  );
}
