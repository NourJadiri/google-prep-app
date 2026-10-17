import StarterQuestions from "./StarterQuestions";
import "./EmptyChat.css";

export default function EmptyChat({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <div className="asst-empty">
      <p>Ask about syntax, your approach or a bug. Each question takes the problem, your code and your last run along.</p>
      <StarterQuestions onAsk={onAsk} />
    </div>
  );
}
