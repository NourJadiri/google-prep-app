import { useApp } from "../../state/AppState.jsx";
import { LC, DIFFN, probXP } from "../../data/plan.js";

/* Check toggle, name, difficulty chip, XP, and a jump to LeetCode.
   The Day-7 mock carries its own url instead of a slug. */

export default function ProblemRow({ prob, done }) {
  const { actions } = useApp();
  const url = prob.url || LC(prob.slug);

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
        href={url}
        target="_blank"
        rel="noopener"
        aria-label={"Open " + prob.n}
      >
        ↗
      </a>
    </li>
  );
}
