import Avatar from "./Avatar";
import StarterQuestions from "./StarterQuestions";
import "./EmptyChat.css";

interface Props {
  intro: string;
  /** With a face, the intro is her first message. */
  avatar?: string;
  mood?: string;
  onAsk: (question: string) => void;
}

export default function EmptyChat({ intro, avatar, mood, onAsk }: Props) {
  return (
    <div className="asst-empty">
      {avatar ? (
        <div className="asst-row">
          <Avatar src={avatar} mood={mood} />
          <p className="asst-bubble">{intro}</p>
        </div>
      ) : (
        <p>{intro}</p>
      )}
      <StarterQuestions onAsk={onAsk} />
    </div>
  );
}
