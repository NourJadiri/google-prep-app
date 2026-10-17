import Avatar from "./Avatar";
import "./TypingDots.css";

export default function TypingDots({ avatar }: { avatar?: string }) {
  const dots = (
    <div className="asst-wait" role="status" aria-label="Thinking">
      <i />
      <i />
      <i />
    </div>
  );
  if (!avatar) return dots;
  return (
    <div className="asst-row">
      <Avatar src={avatar} />
      <div className="asst-bubble">{dots}</div>
    </div>
  );
}
