import { useApp } from "../../state/AppState";
import { DIFFN, probURL, probXP } from "../../data/plan";
import Icon from "../shared/Icon";
import type { Problem } from "../../types";

/* Check toggle, name, difficulty chip, XP, and a jump to LeetCode.
   The timed mocks carry their own url instead of a slug; the premium drills
   carry a drill id, and their book opens the in-app reader instead of a tab. */

interface ProblemRowProps {
  prob: Problem;
  done: boolean;
}

export default function ProblemRow({ prob, done }: ProblemRowProps) {
  const { actions } = useApp();
  const drill = prob.drill;

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
          {drill && <span className="tag">drill</span>}
          <span className="xpv">{"+" + probXP(prob) + " XP"}</span>
        </div>
      </div>
      {drill ? (
        <button
          className="golink"
          onClick={() => actions.openDrill(drill)}
          aria-label={"Read " + prob.n}
        >
          <Icon name="book-open" size={16} />
        </button>
      ) : (
        <a
          className="golink"
          href={probURL(prob)}
          target="_blank"
          rel="noopener"
          aria-label={"Open " + prob.n}
        >
          <Icon name="arrow-up-right" size={16} />
        </a>
      )}
    </li>
  );
}
