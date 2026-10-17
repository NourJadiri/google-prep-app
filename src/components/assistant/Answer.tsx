import { useMemo } from "react";
import { textOf, type Msg } from "./lib/messages";
import { renderAnswer } from "./lib/renderAnswer";
import Note from "./Note";
import "./Answer.css";

export default function Answer({ message }: { message: Msg }) {
  const text = textOf(message);
  const html = useMemo(() => renderAnswer(text), [text]);
  const stop = message.metadata?.stop;
  /* Still thinking: the typing dots stand in for it. */
  if (!text && stop !== "max_tokens" && stop !== "refusal") return null;
  return (
    <div className="asst-a">
      {text && <div className="md" dangerouslySetInnerHTML={{ __html: html }} />}
      {stop === "max_tokens" && <Note>Cut off at the length limit. Ask it to go on.</Note>}
      {stop === "refusal" && <Note>Claude declined to answer that one.</Note>}
    </div>
  );
}
