import type { UIMessage } from "ai";
import type { Snapshot, Turn } from "../../../../shared/assistantContract";
import type { AskContext } from "./askContext";

export interface Meta extends Snapshot {
  /** On an answer: the API's stop reason. */
  stop?: string | null;
}

export type Msg = UIMessage<Meta>;

export const textOf = (m: Msg): string => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

/* The newest snapshot of this kind that went out with a question. */
function lastSent(messages: Msg[], key: keyof Snapshot): string | undefined {
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
export function toTurn(m: Msg): Turn {
  const text = textOf(m);
  if (m.role !== "user") return { role: "assistant", text };
  return {
    role: "user",
    text,
    ...(m.metadata?.code !== undefined ? { code: m.metadata.code } : {}),
    ...(m.metadata?.run ? { run: m.metadata.run } : {}),
  };
}
