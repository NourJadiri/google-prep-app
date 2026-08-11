import { useApp } from "../../state/AppState.jsx";
import DeckPicker from "./DeckPicker.jsx";
import QuizCard from "./QuizCard.jsx";
import RunResult from "./RunResult.jsx";
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
      {!s ? <DeckPicker /> : s.phase === "done" ? <RunResult /> : <QuizCard />}
    </section>
  );
}
