import { useMemo } from "react";
import { textOf, type Msg } from "./lib/messages";
import { renderAnswer } from "./lib/renderAnswer";
import Avatar from "./Avatar";
import ChatNote from "./ChatNote";
import "./Answer.css";

export default function Answer({ message, avatar }: { message: Msg; avatar?: string }) {
  const text = textOf(message);
  const html = useMemo(() => renderAnswer(text), [text]);
  const stop = message.metadata?.stop;
  /* Still thinking: the typing dots stand in for it. */
  if (!text && stop !== "max_tokens" && stop !== "refusal") return null;
  const body = (
    <>
      {text && <div className="md" dangerouslySetInnerHTML={{ __html: html }} />}
      {stop === "max_tokens" && <ChatNote>Cut off at the length limit. Ask it to go on.</ChatNote>}
      {stop === "refusal" && <ChatNote>Bana declined to answer that one.</ChatNote>}
    </>
  );
  if (!avatar) return <div className="asst-a">{body}</div>;
  return (
    <div className="asst-a chat">
      <Avatar src={avatar} />
      <div className="asst-bubble">{body}</div>
    </div>
  );
}
