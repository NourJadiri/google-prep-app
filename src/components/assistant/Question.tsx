import { textOf, type Msg } from "./lib/messages";
import "./Question.css";

export default function Question({ message }: { message: Msg }) {
  const code = message.metadata?.code !== undefined;
  const run = !!message.metadata?.run;
  return (
    <div className="asst-q">
      <p>{textOf(message)}</p>
      {(code || run) && (
        <span className="asst-tags" title="Sent along with this question">
          {code && <span>+ code</span>}
          {run && <span>+ last run</span>}
        </span>
      )}
    </div>
  );
}
