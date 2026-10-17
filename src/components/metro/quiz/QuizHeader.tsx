import { CATN } from "../../../data/questions";
import { multiplier } from "../../../lib/engine";
import type { QType } from "../../../types";
import Icon from "../../shared/Icon";
import "./QuizHeader.css";

interface QuizHeaderProps {
  type: QType;
  /** The card's place in the run, from 1. */
  step: number;
  total: number;
  streak: number;
  xp: number;
}

export default function QuizHeader({ type, step, total, streak, xp }: QuizHeaderProps) {
  const mult = multiplier(streak);

  return (
    <div className="qtop">
      <span className={"qcat " + type}>{CATN[type]}</span>
      <span className="qmeta">
        <span>{step + "/" + total}</span>
        {streak >= 2 && (
          <span className="streak">
            <Icon name="flame" size={12} />
            {streak}
          </span>
        )}
        {mult > 1 && <span className="mult">{"×" + mult}</span>}
        <span>{"+" + xp}</span>
      </span>
    </div>
  );
}
