import StarterQuestions from "./StarterQuestions";
import "./EmptyChat.css";

export default function EmptyChat({ intro, onAsk }: { intro: string; onAsk: (question: string) => void }) {
  return (
    <div className="asst-empty">
      <p>{intro}</p>
      <StarterQuestions onAsk={onAsk} />
    </div>
  );
}
