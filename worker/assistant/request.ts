import type { Problem, Turn } from "./types";

export const MAX_BYTES = 256 * 1024;
const MAX_TURNS = 40;
const MAX_TEXT = 32_000;
const MAX_STATEMENT = 20_000;
const MAX_LABEL = 200;

const str = (v: unknown, max: number): v is string => typeof v === "string" && v.length <= max;

/* The request body, or the reason it is a 400. */
export function parseRequest(text: string): { problem: Problem; turns: Turn[] } | string {
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return "body must be JSON";
  }
  if (!body || typeof body !== "object") return "body must be an object";
  const { problem, turns } = body as { problem?: unknown; turns?: unknown };

  if (!problem || typeof problem !== "object") return "problem is required";
  const p = problem as Record<string, unknown>;
  if (!str(p.title, MAX_LABEL) || !str(p.source, MAX_LABEL) || !str(p.statement, MAX_STATEMENT)) {
    return "problem needs a title, a source and a statement";
  }

  if (!Array.isArray(turns) || turns.length === 0 || turns.length > MAX_TURNS) {
    return `turns must hold 1 to ${MAX_TURNS} messages`;
  }
  const out: Turn[] = [];
  for (const raw of turns as unknown[]) {
    if (!raw || typeof raw !== "object") return "each turn must be an object";
    const t = raw as Record<string, unknown>;
    if (t.role !== "user" && t.role !== "assistant") return "a turn's role is user or assistant";
    if (!str(t.text, MAX_TEXT)) return "a turn's text is missing or too long";
    const turn: Turn = { role: t.role, text: t.text };
    if (t.role === "user") {
      if (t.code !== undefined) {
        if (!str(t.code, MAX_TEXT)) return "code is too long";
        turn.code = t.code;
      }
      if (t.run !== undefined) {
        if (!str(t.run, MAX_TEXT)) return "run report is too long";
        turn.run = t.run;
      }
    }
    /* An answer stopped before its first word leaves an empty turn behind; the API wants non-empty text, and the turn carried nothing anyway. */
    if (turn.text.trim() || turn.role === "user") out.push(turn);
  }
  if (out[0]?.role !== "user" || out[out.length - 1]?.role !== "user") {
    return "the conversation must start and end with a question";
  }
  if (out.some((t) => t.role === "user" && !t.text.trim())) return "a question is empty";
  return { problem: p as unknown as Problem, turns: out };
}
