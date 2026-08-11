import { useApp } from "../../state/AppState";
import { DIFFN, probURL, probXP } from "../../data/plan";
import type { Problem } from "../../types";

/* Check toggle, name, difficulty chip, XP, and a jump to LeetCode.
   The Day-7 mock carries its own url instead of a slug. */

interface ProblemRowProps {
  prob: Problem;
  done: boolean;
}

export default function ProblemRow({ prob, done }: ProblemRowProps) {
  const { actions } = useApp();

  return (
    <li className={"prow" + (done ? " done" : "")}>
      <button
        className="pcheck"
        onClick={() => actions.toggleProb(prob.id)}
        aria-pressed={done}
        aria-label={(done ? "Uncheck " : "Check ") + prob.n}
      >
        ✓
      </button>
      <div className="pmain">
        <span className="pname">{prob.n}</span>
        <div className="pmeta">
          <span className={"diff " + prob.diff}>{DIFFN[prob.diff]}</span>
          {prob.warm && <span className="tag">warm-up</span>}
          <span className="xpv">{"+" + probXP(prob) + " XP"}</span>
        </div>
      </div>
      <a
        className="golink"
        href={probURL(prob)}
        target="_blank"
        rel="noopener"
        aria-label={"Open " + prob.n}
      >
        ↗
      </a>
    </li>
  );
}
