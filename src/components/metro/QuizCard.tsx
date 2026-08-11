import { useApp } from "../../state/AppState";
import { CATN } from "../../data/questions";
import { currentCard } from "../../lib/engine";
import CodeBlock from "../shared/CodeBlock";
import StopsTrack from "./StopsTrack";
import type { Session } from "../../types";

/* One card. Options are stored answer-first and shuffled per display, so the
   run carries a permutation (`order`) and every lookup goes through it:
   `order[slot]` is the stored index sitting in the slot you tapped. */

export default function QuizCard({ session: s }: { session: Session }) {
  const { actions } = useApp();
  const q = currentCard(s);
  if (!q) return null; // a run pointing past its own ids; unreachable in practice

  const reveal = s.phase === "reveal";
  const mult = s.streak >= 6 ? "×3" : s.streak >= 3 ? "×2" : "";
  const last = s.i + 1 >= s.ids.length;

  return (
    <div className="qwrap">
      <div className="qtop">
        <span className={"qcat " + q.t}>{CATN[q.t]}</span>
        <span className="qmeta">
          <span>{s.i + 1 + "/" + s.ids.length}</span>
          {s.streak >= 2 && <span>{"🔥" + s.streak}</span>}
          {mult && <span className="mult">{mult}</span>}
          <span>{"+" + s.xp}</span>
        </span>
      </div>

      <p className="qtext">{q.q}</p>
      {q.code && <CodeBlock code={q.code} />}

      <div className="opts">
        {s.order.map((orig, slot) => {
          let cls = "opt";
          if (reveal) {
            if (orig === q.a) cls += " right";
            else if (slot === s.picked) cls += " wrong";
            else cls += " dim";
          }
          return (
            <button
              key={slot}
              className={cls}
              disabled={reveal}
              onClick={() => actions.answer(slot)}
            >
              <span className="k">{"ABCD"[slot]}</span>
              {q.o[orig]}
            </button>
          );
        })}
      </div>

      {reveal ? (
        <>
          <div className="explain">{q.x}</div>
          <div className="qnav">
            <button className="quit" onClick={actions.quitRun}>
              End run
            </button>
            <button className="next" onClick={actions.next}>
              {last ? "Finish" : "Next stop →"}
            </button>
          </div>
        </>
      ) : (
        <div className="qnav">
          <button className="quit" onClick={actions.quitRun}>
            End run
          </button>
          <span />
        </div>
      )}

      <StopsTrack ids={s.ids} results={s.results} />
    </div>
  );
}
