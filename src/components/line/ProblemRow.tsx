import { cx } from "../../lib/cx";
import type { Problem } from "../../types";
import Icon from "../shared/Icon";
import ProblemAction from "./ProblemAction";
import ProblemTags from "./ProblemTags";
import "./pcheck.css";
import "./ProblemRow.css";

interface ProblemRowProps {
  prob: Problem;
  done: boolean;
  /** Every test went green in the editor, as opposed to a tick by hand. */
  passed: boolean;
  onToggle: () => void;
  onOpenEditor: () => void;
}

export default function ProblemRow({ prob, done, passed, onToggle, onOpenEditor }: ProblemRowProps) {
  return (
    <li className={cx("prow", done && "done")}>
      <button
        className="pcheck"
        onClick={onToggle}
        aria-pressed={done}
        aria-label={(done ? "Uncheck " : "Check ") + prob.n}
      >
        <Icon name="check" size={14} strokeWidth={3} />
      </button>
      <div className="pmain">
        <span className="pname">{prob.n}</span>
        <ProblemTags prob={prob} passed={passed} />
      </div>
      <ProblemAction prob={prob} onOpenEditor={onOpenEditor} />
    </li>
  );
}
