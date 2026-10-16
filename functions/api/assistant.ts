/* The assistant endpoint: the only place the Anthropic key is ever used.
 *
 * The key is a Cloudflare secret (ANTHROPIC_API_KEY) that only this Function
 * can read — it is never in the bundle, never in git, never in a browser. The
 * door in front of it is a second secret, ASSISTANT_PASSWORD: every request
 * carries it as a bearer token, compared in constant time. If either secret is
 * missing (a preview deploy, a fork, a fresh project) the answer is 503 and
 * nothing is called; the door fails closed.
 *
 * Deliberately not a proxy. The browser sends the problem and the
 * conversation, nothing else: the model, the token cap, the effort and the
 * system prompt are all decided here, so even a leaked password buys a chat
 * with Haiku about Python, never the key itself or a bigger model on our bill.
 *
 * The answer streams back in the AI SDK's UI message protocol, which is what
 * the panel's useChat reads; the call itself goes through Anthropic's own SDK.
 * Swapping providers later is this file's business and nobody else's.
 */

import Anthropic from "@anthropic-ai/sdk";
import { createUIMessageStream, createUIMessageStreamResponse, type FinishReason, type UIMessageChunk } from "ai";

interface Env {
  ANTHROPIC_API_KEY?: string;
  ASSISTANT_PASSWORD?: string;
  /* Optional: route through Cloudflare AI Gateway, or a local mock in dev. */
  ANTHROPIC_BASE_URL?: string;
}

const MODEL = "claude-haiku-5-5";
/* Thinking counts against this too; low effort keeps most answers far under. */
const MAX_TOKENS = 8192;

/* Same ceiling as sync: a conversation that outgrows it is someone else's. */
const MAX_BYTES = 256 * 1024;
const MAX_TURNS = 40;
const MAX_TEXT = 32_000;
const MAX_STATEMENT = 20_000;
const MAX_LABEL = 200;

const PERSONA = `You are the assistant in a small floating window inside an interview-prep app. The user is solving a LeetCode-style problem in Python and has called you up mid-attempt with a quick question: usually syntax, their approach, or a bug.

How their code runs: CPython 3.14 in the browser (Pyodide). LeetCode's environment is in scope without imports: everything from typing, collections, heapq, bisect, itertools and functools, plus the modules collections, heapq, bisect, math, itertools, functools, string, re, random and operator. ListNode and TreeNode are defined, and a fresh Solution() is created for each test. No third-party packages.

Their messages may carry a snapshot of their code and of their latest test run. The most recent snapshot is what is in their editor now.

How to help:
- Python and syntax questions: answer directly, with a short example when it helps.
- Bugs: say what is wrong, where (the line or expression) and why. A minimal fix for that bug is fine; don't rewrite the rest.
- Their approach: be honest about whether it works, its time and space complexity, and the edge cases it misses. Don't write a complete solution or a full alternative implementation unless they explicitly ask for one; when they do, give it.
- Keep it short: the window is small. Plain paragraphs and short lists, code in \`\`\`python fences, no headings, no preamble.`;

interface Problem {
  title: string;
  source: string;
  statement: string;
}

interface Turn {
  role: "user" | "assistant";
  text: string;
  /** User turns only: the editor's code, when it changed since the last question. */
  code?: string;
  /** User turns only: the latest run's report, when there is a new one. */
  run?: string;
}

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const err = (status: number, error: string): Response => json(status, { error });

/* Hashing first gives timingSafeEqual the equal lengths it requires, and
   keeps the password's length out of the timing too. */
async function sameSecret(given: string, expected: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(given)),
    crypto.subtle.digest("SHA-256", enc.encode(expected)),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}

const str = (v: unknown, max: number): v is string => typeof v === "string" && v.length <= max;

/* The whole contract, checked field by field: anything else is a 400. */
function parse(text: string): { problem: Problem; turns: Turn[] } | string {
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
    /* An answer stopped before its first word leaves an empty turn behind;
       the API wants non-empty text, and the turn carried nothing anyway. */
    if (turn.text.trim() || turn.role === "user") out.push(turn);
  }
  if (out[0]?.role !== "user" || out[out.length - 1]?.role !== "user") {
    return "the conversation must start and end with a question";
  }
  if (out.some((t) => t.role === "user" && !t.text.trim())) return "a question is empty";
  return { problem: p as unknown as Problem, turns: out };
}

function system(p: Problem): string {
  const attr = (s: string) => s.replace(/["<>]/g, "");
  return `${PERSONA}\n\n<problem title="${attr(p.title)}" source="${attr(p.source)}">\n${p.statement.trim()}\n</problem>`;
}

/* A question with its snapshots in front, so the model reads the code it is
   being asked about before the question itself. */
function userContent(t: Turn): string {
  const parts: string[] = [];
  if (t.code !== undefined) parts.push("My code now:\n\n```python\n" + t.code.trimEnd() + "\n```");
  if (t.run) parts.push(t.run.trim());
  parts.push(parts.length ? "My question: " + t.text.trim() : t.text.trim());
  return parts.join("\n\n");
}

const FINISH: Partial<Record<Anthropic.StopReason, FinishReason>> = {
  end_turn: "stop",
  max_tokens: "length",
  model_context_window_exceeded: "length",
  refusal: "content-filter",
};

/* What the panel shows when the call fails. The caller already proved the
   password, so naming the cause is a help, not a leak. Most specific first:
   APIConnectionError is itself an APIError in this SDK. */
function describe(e: unknown): string {
  if (e instanceof Anthropic.APIConnectionError) return "Couldn't reach Anthropic. Try again in a moment.";
  if (e instanceof Anthropic.APIError) {
    switch (e.type) {
      case "authentication_error":
        return "Anthropic rejected the API key. Check ANTHROPIC_API_KEY in the Cloudflare project.";
      case "permission_error":
        return "This API key isn't allowed to use Claude Haiku 5.5.";
      case "billing_error":
        return "The Anthropic account is out of credit, or its spend limit is reached.";
      case "rate_limit_error":
        return "Rate limited by Anthropic. Wait a bit and ask again.";
      case "overloaded_error":
        return "Anthropic is overloaded right now. Try again in a moment.";
      case "invalid_request_error": {
        const detail = (e.error as { error?: { message?: unknown } } | undefined)?.error?.message;
        return "Anthropic refused the request" + (typeof detail === "string" ? `: ${detail}` : ".");
      }
    }
    return `Anthropic answered with an error (${e.status ?? "no status"}).`;
  }
  return "Something went wrong on the server.";
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const apiKey = env.ANTHROPIC_API_KEY;
  const password = env.ASSISTANT_PASSWORD;
  if (!apiKey || !password) return err(503, "the assistant is not set up on this deployment");

  const auth = request.headers.get("authorization") ?? "";
  const given = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!given || !(await sameSecret(given, password))) return err(401, "wrong password");

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES) return err(413, "conversation too long");
  const text = await request.text();
  if (text.length > MAX_BYTES) return err(413, "conversation too long");

  const parsed = parse(text);
  if (typeof parsed === "string") return err(400, parsed);
  const { problem, turns } = parsed;

  const client = new Anthropic({ apiKey, ...(env.ANTHROPIC_BASE_URL ? { baseURL: env.ANTHROPIC_BASE_URL } : {}) });
  const claude = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    /* Caches the conversation so far; a no-op while it is under the
       model's minimum prefix. */
    cache_control: { type: "ephemeral" },
    system: system(problem),
    messages: turns.map((t) => ({ role: t.role, content: t.role === "user" ? userContent(t) : t.text })),
  });

  /* Anthropic's events, translated: each text block becomes a text part;
     thinking blocks (empty under the default display) are skipped. Merged
     rather than written, so a client that hangs up cancels this stream, and
     cancelling it aborts the call instead of paying for an unread answer. */
  const answer = new ReadableStream<UIMessageChunk>({
    async start(controller) {
      const open = new Set<number>();
      try {
        for await (const event of claude) {
          if (event.type === "content_block_start" && event.content_block.type === "text") {
            open.add(event.index);
            controller.enqueue({ type: "text-start", id: `t${event.index}` });
          } else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue({ type: "text-delta", id: `t${event.index}`, delta: event.delta.text });
          } else if (event.type === "content_block_stop" && open.delete(event.index)) {
            controller.enqueue({ type: "text-end", id: `t${event.index}` });
          }
        }
        const final = await claude.finalMessage();
        controller.enqueue({
          type: "finish",
          finishReason: (final.stop_reason && FINISH[final.stop_reason]) || "other",
          messageMetadata: { stop: final.stop_reason },
        });
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
    cancel() {
      claude.abort();
    },
  });

  const stream = createUIMessageStream({
    execute({ writer }) {
      writer.write({ type: "start" });
      writer.merge(answer);
    },
    onError(e) {
      if (!(e instanceof Anthropic.APIUserAbortError)) console.error("assistant:", e);
      return describe(e);
    },
  });

  return createUIMessageStreamResponse({ stream, headers: { "cache-control": "no-store" } });
};
