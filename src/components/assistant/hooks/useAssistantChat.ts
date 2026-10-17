import { useEffect, useMemo, type RefObject } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useLatest } from "../../../hooks/useLatest";
import type { AskContext } from "../lib/askContext";
import { MAX_TURNS, snapshotMeta, textOf, toTurn, type Msg } from "../lib/messages";
import { troubleOf } from "../lib/trouble";

interface Options {
  password: RefObject<string | null>;
  /** Read when a question is sent, so it is the editor as it is then. */
  context: () => AskContext;
  /** Called, with the error cleared, when the Worker refuses the password. */
  onRefused: () => void;
}

export function useAssistantChat({ password, context, onRefused }: Options) {
  const ctx = useLatest(context);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<Msg>({
        api: "/api/assistant",
        headers: () => ({ authorization: `Bearer ${password.current ?? ""}` }),
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { problem: ctx.current().problem, turns: messages.map(toTurn) },
        }),
      }),
    [password, ctx]
  );
  const { messages, sendMessage, regenerate, stop, status, error, clearError, setMessages } = useChat<Msg>({
    transport,
    throttle: 50,
  });

  const trouble = error ? troubleOf(error) : null;
  const busy = status === "submitted" || status === "streaming";
  const full = messages.length + 1 > MAX_TURNS;
  const last = messages[messages.length - 1];
  const unanswered = last?.role === "user";
  const waiting = status === "submitted" || (status === "streaming" && last?.role === "assistant" && !textOf(last));

  useEffect(() => {
    if (!error || troubleOf(error).kind !== "locked") return;
    onRefused();
    clearError();
  }, [error, clearError, onRefused]);

  /* False when nothing was sent. */
  const ask = (raw: string): boolean => {
    const text = raw.trim();
    if (!text || busy || full || !password.current) return false;
    void sendMessage({ text, metadata: snapshotMeta(messages, ctx.current()) });
    return true;
  };

  const retry = () => void regenerate();

  const reset = () => {
    if (busy) void stop();
    setMessages([]);
    clearError();
  };

  return { messages, status, error, trouble, busy, full, waiting, unanswered, ask, retry, reset, stop: () => void stop() };
}
