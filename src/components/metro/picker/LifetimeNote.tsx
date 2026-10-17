import type { QuizData } from "../../../types";
import Note from "../../ui/Note";

export default function LifetimeNote({ quiz }: { quiz: QuizData }) {
  if (!quiz.answered) {
    return (
      <Note>
        Patterns, bug hunts, missing lines, complexity. Tap the right answer — streaks
        multiply the XP (×2 at 3, ×3 at 6). Wrong ones go to the Redemption deck.
      </Note>
    );
  }
  return (
    <Note>
      {quiz.correct +
        "/" +
        quiz.answered +
        " lifetime · best streak " +
        quiz.bestStreak +
        " · " +
        quiz.sessions +
        " runs"}
    </Note>
  );
}
