import { memo, useRef, useState } from "react";
import { cx } from "../../lib/cx";
import AssistantHeader from "./AssistantHeader";
import Composer from "./Composer";
import { useAssistantChat } from "./hooks/useAssistantChat";
import { useFloatingBox } from "./hooks/useFloatingBox";
import { usePassword } from "./hooks/usePassword";
import { useStickToBottom } from "./hooks/useStickToBottom";
import { useWindowFocus } from "./hooks/useWindowFocus";
import type { AskContext } from "./lib/askContext";
import { onWindowKeyDown } from "./lib/windowKeys";
import LockScreen from "./LockScreen";
import MessageLog from "./MessageLog";
import "./Assistant.css";

interface Props {
  open: boolean;
  /** Bumped by every ⌘K or Ask press that should land focus here. */
  summon: number;
  onClose: () => void;
  /** Read when a question is sent, so it is the editor as it is then. */
  context: () => AskContext;
  wide: boolean;
}

/* Memoised: every prop is stable while you type in the editor, so typing never re-renders the chat. */
export default memo(Assistant);

function Assistant({ open, summon, onClose, context, wide }: Props) {
  const panel = useRef<HTMLElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const passwordField = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");

  const password = usePassword();
  const chat = useAssistantChat({ password: password.ref, context, onRefused: password.refuse });
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
      aria-label="Assistant"
      onKeyDown={(e) => onWindowKeyDown(e, onClose)}
    >
      <AssistantHeader
        drag={box.dragHandlers}
        hasChat={chat.messages.length > 0}
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
          />
          <Composer draft={draft} onDraft={setDraft} onSend={ask} onStop={chat.stop} busy={chat.busy} full={chat.full} inputRef={composer} />
        </>
      ) : (
        <LockScreen refused={password.refused} inputRef={passwordField} onUnlock={unlock} />
      )}
    </section>
  );
}
