import { useApp } from "../../state/AppState.jsx";
import { DECKS } from "../../data/questions.js";

/* Pick a deck, board the train. Redemption is greyed out until you've actually
   missed something. */

export default function DeckPicker() {
  const { state, actions } = useApp();
  const quiz = state.data.quiz;
  const redo = quiz.missed.length;

  return (
    <>
      <div className="decks">
        {DECKS.map((d) => (
          <button
            key={d.id}
            className={"deck" + (state.deck === d.id ? " sel" : "")}
            disabled={d.id === "redo" && redo === 0}
            aria-pressed={state.deck === d.id}
            onClick={() => actions.setDeck(d.id)}
          >
            {d.id === "redo" ? d.n + " (" + redo + ")" : d.n}
          </button>
        ))}
      </div>

      <button className="board" onClick={actions.startRun}>
        🚇 Board — 10 stops
      </button>

      {quiz.answered ? (
        <p className="storenote">
          {quiz.correct +
            "/" +
            quiz.answered +
            " lifetime · best streak " +
            quiz.bestStreak +
            " · " +
            quiz.sessions +
            " runs"}
        </p>
      ) : (
        <p className="storenote">
          Patterns, bug hunts, missing lines, complexity. Tap the right answer — streaks
          multiply the XP (×2 at 3, ×3 at 6). Wrong ones go to the Redemption deck.
        </p>
      )}
    </>
  );
}
