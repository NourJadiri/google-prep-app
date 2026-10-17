import type { Question, Session } from "../../../types";
import AnswerOption from "./AnswerOption";
import { optionState } from "./lib/optionState";
import "./AnswerOptions.css";

interface AnswerOptionsProps {
  question: Question;
  session: Session;
  onPick: (slot: number) => void;
}

/* Options are stored answer-first and shown shuffled: `order[slot]` is the stored
   index sitting in a slot, so the answer is matched by stored index and the pick by slot. */
export default function AnswerOptions({ question: q, session: s, onPick }: AnswerOptionsProps) {
  const revealed = s.phase === "reveal";

  return (
    <div className="opts">
      {s.order.map((stored, slot) => (
        <AnswerOption
          key={slot}
          slot={slot}
          label={q.o[stored]}
          state={optionState({ revealed, stored, slot, answer: q.a, picked: s.picked })}
          onPick={onPick}
        />
      ))}
    </div>
  );
}
