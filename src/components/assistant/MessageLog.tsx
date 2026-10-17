import type { RefObject } from "react";
import Answer from "./Answer";
import EmptyChat from "./EmptyChat";
import type { Msg } from "./lib/messages";
import { ONE_SHOT_MOOD } from "../../../shared/assistantContract";
import { faceOf, type PersonaLook } from "./lib/personas";
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
  look: PersonaLook;
  /** Fresh from a one-shot: an empty chat opens on her cheering. */
  cheer: boolean;
}

export default function MessageLog({ logRef, onScroll, messages, waiting, busy, full, trouble, onAsk, onRetry, onNewChat, look, cheer }: Props) {
  return (
    <div className="asst-log" ref={logRef} onScroll={onScroll}>
      {messages.length === 0 &&
        (cheer && look.oneShotIntro ? (
          <EmptyChat intro={look.oneShotIntro} avatar={faceOf(look, ONE_SHOT_MOOD)} mood={ONE_SHOT_MOOD} onAsk={onAsk} />
        ) : (
          <EmptyChat intro={look.intro} avatar={look.avatar} onAsk={onAsk} />
        ))}
      {messages.map((m) => (m.role === "user" ? <Question key={m.id} message={m} /> : <Answer key={m.id} message={m} look={look} />))}
      {waiting && <TypingDots avatar={look.avatar} />}
      {trouble && trouble.kind !== "locked" && <TroubleNotice trouble={trouble} onRetry={onRetry} onNewChat={onNewChat} />}
      {full && !busy && <ChatNote>This chat is full. Start a new one to keep going.</ChatNote>}
    </div>
  );
}
