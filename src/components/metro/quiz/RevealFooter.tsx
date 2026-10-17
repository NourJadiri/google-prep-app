import Icon from "../../shared/Icon";
import QuizNav from "./QuizNav";
import "./RevealFooter.css";

interface RevealFooterProps {
  explanation: string;
  /** The last stop reads "Finish" instead of "Next stop". */
  last: boolean;
  onNext: () => void;
  onQuit: () => void;
}

export default function RevealFooter({ explanation, last, onNext, onQuit }: RevealFooterProps) {
  return (
    <>
      <div className="explain">{explanation}</div>
      <QuizNav onQuit={onQuit}>
        <button className="next" onClick={onNext}>
          {last ? "Finish" : "Next stop"}
          <Icon name="arrow-right" size={15} />
        </button>
      </QuizNav>
    </>
  );
}
