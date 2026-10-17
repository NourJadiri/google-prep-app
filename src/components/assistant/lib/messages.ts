import type { UIMessage } from "ai";
import type { AskContext } from "./askContext";

export interface Meta {
  /** On a question: the code it was asked about, when it changed since the last one. */
  code?: string;
  /** On a question: the run report, when it is new since the last one. */
  run?: string;
  /** On an answer: the API's stop reason. */
  stop?: string | null;
}

export type Msg = UIMessage<Meta>;

/* The Worker refuses a conversation longer than this. */
export const MAX_TURNS = 40;

export const textOf = (m: Msg): string => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

/* The newest snapshot of this kind that went out with a question. */
function lastSent(messages: Msg[], key: "code" | "run"): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    const v = m?.role === "user" ? m.metadata?.[key] : undefined;
    if (v !== undefined) return v;
  }
  return undefined;
}

export function snapshotMeta(messages: Msg[], now: AskContext): Meta {
  const meta: Meta = {};
  if (now.code !== lastSent(messages, "code")) meta.code = now.code;
  if (now.run && now.run !== lastSent(messages, "run")) meta.run = now.run;
  return meta;
}

/* The wire shape the Worker checks, field by field. */
export function toTurn(m: Msg) {
  const text = textOf(m);
  if (m.role !== "user") return { role: "assistant" as const, text };
  return {
    role: "user" as const,
    text,
    ...(m.metadata?.code !== undefined ? { code: m.metadata.code } : {}),
    ...(m.metadata?.run ? { run: m.metadata.run } : {}),
  };
}
