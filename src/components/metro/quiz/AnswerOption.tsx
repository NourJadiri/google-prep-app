import { cx } from "../../../lib/cx";
import type { OptionState } from "./lib/optionState";
import "./AnswerOption.css";

interface AnswerOptionProps {
  slot: number;
  label: string | undefined;
  state: OptionState | null;
  onPick: (slot: number) => void;
}

export default function AnswerOption({ slot, label, state, onPick }: AnswerOptionProps) {
  return (
    <button className={cx("opt", state)} disabled={state !== null} onClick={() => onPick(slot)}>
      <span className="k">{"ABCD"[slot]}</span>
      {label}
    </button>
  );
}
