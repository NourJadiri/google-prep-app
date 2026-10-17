import { useApp } from "../../state/AppState";
import MetroHero from "./MetroHero";
import DeckPicker from "./picker/DeckPicker";
import QuizCard from "./quiz/QuizCard";
import RunResult from "./result/RunResult";

export default function MetroView() {
  const { state, actions } = useApp();
  const s = state.session;

  return (
    <section className="view on">
      <MetroHero />

      {/* The regression suites select on this mount point. */}
      <div id="quizArea">
        {!s ? (
          <DeckPicker />
        ) : s.phase === "done" ? (
          <RunResult session={s} onAgain={actions.startRun} onDecks={actions.quitRun} />
        ) : (
          <QuizCard session={s} onAnswer={actions.answer} onNext={actions.next} onQuit={actions.quitRun} />
        )}
      </div>
    </section>
  );
}
