import type { RefObject } from "react";
import Answer from "./Answer";
import EmptyChat from "./EmptyChat";
import type { Msg } from "./lib/messages";
import type { Trouble } from "./lib/trouble";
import ChatNote from "./ChatNote";
import Question from "./Question";
import TroubleNotice from "./TroubleNotice";
import TypingDots from "./TypingDots";
import "./MessageLog.css";

interface Props {
  logRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  messages: Msg[];
  waiting: boolean;
  busy: boolean;
  full: boolean;
  trouble: Trouble | null;
  onAsk: (question: string) => void;
  onRetry: () => void;
  onNewChat: () => void;
}

export default function MessageLog({ logRef, onScroll, messages, waiting, busy, full, trouble, onAsk, onRetry, onNewChat }: Props) {
  return (
    <div className="asst-log" ref={logRef} onScroll={onScroll}>
      {messages.length === 0 && <EmptyChat onAsk={onAsk} />}
      {messages.map((m) => (m.role === "user" ? <Question key={m.id} message={m} /> : <Answer key={m.id} message={m} />))}
      {waiting && <TypingDots />}
      {trouble && trouble.kind !== "locked" && <TroubleNotice trouble={trouble} onRetry={onRetry} onNewChat={onNewChat} />}
      {full && !busy && <ChatNote>This chat is full. Start a new one to keep going.</ChatNote>}
    </div>
  );
}
