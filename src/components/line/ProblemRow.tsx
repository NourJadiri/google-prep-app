import { useApp } from "../../state/AppState";
import { DIFFN, probURL, probXP } from "../../data/plan";
import { specOf } from "../../data/tracks";
import { hasProblem } from "../../data/problems";
import Icon from "../shared/Icon";
import type { Problem } from "../../types";

/* Check toggle, name, difficulty chip, XP, and the way in: the workspace for
   every problem the bank has (statement, editor, tests), LeetCode only for
   the timed mocks, which are a random pick by design. "passed" marks a
   problem whose every test went green in the editor, as opposed to one
   ticked by hand after solving it elsewhere. */

interface ProblemRowProps {
  prob: Problem;
  done: boolean;
  passed: boolean;
}

export default function ProblemRow({ prob, done, passed }: ProblemRowProps) {
  const { actions } = useApp();
  const inApp = hasProblem(specOf(prob));
  const url = probURL(prob);

  return (
    <li className={"prow" + (done ? " done" : "")}>
      <button
        className="pcheck"
        onClick={() => actions.toggleProb(prob.id)}
        aria-pressed={done}
        aria-label={(done ? "Uncheck " : "Check ") + prob.n}
      >
        <Icon name="check" size={14} strokeWidth={3} />
      </button>
      <div className="pmain">
        <span className="pname">{prob.n}</span>
        <div className="pmeta">
          <span className={"diff " + prob.diff}>{DIFFN[prob.diff]}</span>
          {prob.warm && <span className="tag">warm-up</span>}
          {prob.drill && <span className="tag">{prob.orig ? "original" : "premium"}</span>}
          {passed && <span className="tag passed">passed</span>}
          <span className="xpv">{"+" + probXP(prob) + " XP"}</span>
        </div>
      </div>
      {inApp ? (
        <button
          className="golink code"
          onClick={() => actions.openWork(prob.id)}
          aria-label={"Solve " + prob.n + " in the editor"}
          title="Open in the editor"
        >
          <Icon name="code" size={16} />
        </button>
      ) : url ? (
        <a
          className="golink"
          href={url}
          target="_blank"
          rel="noopener"
          aria-label={"Open " + prob.n}
        >
          <Icon name="arrow-up-right" size={16} />
        </a>
      ) : null}
    </li>
  );
}
