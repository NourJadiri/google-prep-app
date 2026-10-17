import "./StarterQuestions.css";

const STARTERS = ["Why does my code fail?", "Is my approach on the right track?", "What's the complexity of my code?"];

export default function StarterQuestions({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <div className="asst-starters">
      {STARTERS.map((s) => (
        <button key={s} onClick={() => onAsk(s)}>
          {s}
        </button>
      ))}
    </div>
  );
}
