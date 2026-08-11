import { useApp } from "../../state/AppState";
import DeckPicker from "./DeckPicker";
import QuizCard from "./QuizCard";
import RunResult from "./RunResult";
import "./metro.css";

export default function MetroView() {
  const { state } = useApp();
  const s = state.session;

  return (
    <section className="view on">
      <div className="hero">
        <h1>
          Metro <b>mode</b>
        </h1>
        <p>
          Thumb-only drills for the commute or the plane. Ten stops per run, streaks multiply
          your XP. No keyboard, no excuses.
        </p>
      </div>
      {/* The reference mounted each tab's body into a container div. Keeping
          them means the rendered DOM matches element for element, so margins
          collapse the same way and a structural diff stays meaningful. */}
      <div id="quizArea">
        {/* The run is passed down rather than re-read from the store, so the
            children take a Session and never a Session | null — this branch is
            the only place the distinction has to be made. */}
        {!s ? (
          <DeckPicker />
        ) : s.phase === "done" ? (
          <RunResult session={s} />
        ) : (
          <QuizCard session={s} />
        )}
      </div>
    </section>
  );
}
