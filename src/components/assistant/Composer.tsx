import type { RefObject } from "react";
import { useAutoGrow } from "./hooks/useAutoGrow";
import SendButton from "./SendButton";
import "./Composer.css";

interface Props {
  draft: string;
  onDraft: (text: string) => void;
  onSend: (text: string) => void;
  onStop: () => void;
  busy: boolean;
  full: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  placeholder: string;
}

export default function Composer({ draft, onDraft, onSend, onStop, busy, full, inputRef, placeholder }: Props) {
  useAutoGrow(inputRef, draft);

  return (
    <form
      className="asst-compose"
      onSubmit={(e) => {
        e.preventDefault();
        onSend(draft);
      }}
    >
      <textarea
        ref={inputRef}
        rows={1}
        value={draft}
        placeholder={placeholder}
        aria-label="Your question"
        onChange={(e) => onDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            onSend(draft);
          }
        }}
      />
      <SendButton busy={busy} disabled={!draft.trim() || full} onStop={onStop} />
    </form>
  );
}
