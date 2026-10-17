import { memo, useEffect, useRef, useState } from "react";
import { ONE_SHOT_MOOD } from "../../../shared/assistantContract";
import { cx } from "../../lib/cx";
import AssistantHeader from "./AssistantHeader";
import Composer from "./Composer";
import { useAssistantChat } from "./hooks/useAssistantChat";
import { useFloatingBox } from "./hooks/useFloatingBox";
import { usePassword } from "./hooks/usePassword";
import { usePersona } from "./hooks/usePersona";
import { lastMood } from "./lib/messages";
import { lookOf } from "./lib/personas";
import { usePreload } from "./hooks/usePreload";
import { useStickToBottom } from "./hooks/useStickToBottom";
import { useWindowFocus } from "./hooks/useWindowFocus";
import type { AskContext } from "./lib/askContext";
import { onWindowKeyDown } from "./lib/windowKeys";
import LockScreen from "./LockScreen";
import MessageLog from "./MessageLog";
import "./Assistant.css";
import "./personas.css";

interface Props {
  open: boolean;
  /** Bumped by every ⌘K or Ask press that should land focus here. */
  summon: number;
  onClose: () => void;
  /** Read when a question is sent, so it is the editor as it is then. */
  context: () => AskContext;
  /** The problem was just one-shot. */
  oneShot: boolean;
  wide: boolean;
}

/* Memoised: every prop is stable while you type in the editor, so typing never re-renders the chat. */
export default memo(Assistant);

function Assistant({ open, summon, onClose, context, oneShot, wide }: Props) {
  const panel = useRef<HTMLElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const passwordField = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");

  const password = usePassword();
  const voice = usePersona();
  const look = lookOf(voice.persona);
  usePreload(look.faces);
  const chat = useAssistantChat({ password: password.ref, context, onRefused: password.refuse, persona: voice.persona, oneShot });
  const cheering = useCheer(oneShot, chat.messages.filter((m) => m.role === "assistant").length) && !!look.faces;
  const log = useStickToBottom([chat.messages, chat.status, chat.error, open]);
  const box = useFloatingBox(panel, wide);
  useWindowFocus(panel, password.value ? composer : passwordField, open, summon);

  const ask = (text: string) => {
    if (!chat.ask(text)) return;
    log.pin();
    setDraft("");
  };

  const retry = () => {
    log.pin();
    chat.retry();
  };

  const unlock = (given: string) => {
    password.unlock(given);
    if (chat.unanswered) retry();
  };

  const newChat = () => {
    chat.reset();
    setDraft("");
    composer.current?.focus();
  };

  return (
    <section
      ref={panel}
      className={cx("asst", wide ? "float" : "sheet")}
      style={box.style}
      hidden={!open}
      role="dialog"
      aria-label="Bana"
      data-persona={voice.persona}
      onKeyDown={(e) => onWindowKeyDown(e, onClose)}
    >
      <AssistantHeader
        drag={box.dragHandlers}
        hasChat={chat.messages.length > 0}
        persona={voice.persona}
        mood={cheering ? ONE_SHOT_MOOD : lastMood(chat.messages)}
        onPersona={voice.choose}
        unlocked={!!password.value}
        onNewChat={newChat}
        onForget={password.forget}
        onClose={onClose}
      />
      {password.value ? (
        <>
          <MessageLog
            logRef={log.ref}
            onScroll={log.onScroll}
            messages={chat.messages}
            waiting={chat.waiting}
            busy={chat.busy}
            full={chat.full}
            trouble={chat.trouble}
            onAsk={ask}
            onRetry={retry}
            onNewChat={newChat}
            look={look}
            cheer={cheering}
          />
          <Composer draft={draft} onDraft={setDraft} onSend={ask} onStop={chat.stop} busy={chat.busy} full={chat.full} inputRef={composer} placeholder={look.placeholder} />
        </>
      ) : (
        <LockScreen refused={password.refused} inputRef={passwordField} onUnlock={unlock} />
      )}
    </section>
  );
}

/* From a one-shot until her next answer, she's still celebrating it. */
function useCheer(oneShot: boolean, answers: number): boolean {
  const [mark, setMark] = useState<number | null>(null);
  useEffect(() => {
    if (oneShot) setMark((m) => m ?? answers);
  }, [oneShot, answers]);
  return oneShot && mark === answers;
}
