import type { ReactNode } from "react";
import "./QuizNav.css";

interface QuizNavProps {
  onQuit: () => void;
  /** What sits opposite "End run"; an empty spacer keeps the row's layout when there is nothing. */
  children?: ReactNode;
}

export default function QuizNav({ onQuit, children = <span /> }: QuizNavProps) {
  return (
    <div className="qnav">
      <button className="quit" onClick={onQuit}>
        End run
      </button>
      {children}
    </div>
  );
}
