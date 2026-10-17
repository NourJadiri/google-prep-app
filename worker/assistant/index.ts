import Anthropic from "@anthropic-ai/sdk";
import { err } from "../http";
import { isAuthorized } from "./auth";
import { hasMoods, MOOD_FORMAT } from "./mood";
import { systemPrompt, toMessages } from "./prompt";
import { MAX_BYTES, parseRequest } from "./request";
import { streamAnswer } from "./stream";

export interface AssistantEnv {
  ANTHROPIC_API_KEY?: string;
  ASSISTANT_PASSWORD?: string;
  /* Route through Cloudflare AI Gateway, or a local mock in dev. */
  ANTHROPIC_BASE_URL?: string;
}

const MODEL = "claude-haiku-5-5";
/* Thinking counts against this too; low effort keeps most answers far under. */
const MAX_TOKENS = 8192;

export async function ask(request: Request, env: AssistantEnv): Promise<Response> {
  const apiKey = env.ANTHROPIC_API_KEY;
  const password = env.ASSISTANT_PASSWORD;
  /* Fails closed: without both secrets nothing is called. */
  if (!apiKey || !password) return err(503, "the assistant is not set up on this deployment");
  if (!(await isAuthorized(request, password))) return err(401, "wrong password");

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES) return err(413, "conversation too long");
  const text = await request.text();
  if (text.length > MAX_BYTES) return err(413, "conversation too long");

  const parsed = parseRequest(text);
  if (typeof parsed === "string") return err(400, parsed);
  const { problem, turns, persona = "normal" } = parsed;
  const moods = hasMoods(persona);

  const client = new Anthropic({ apiKey, ...(env.ANTHROPIC_BASE_URL ? { baseURL: env.ANTHROPIC_BASE_URL } : {}) });
  const claude = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    thinking: { type: "adaptive" },
    output_config: { effort: "low", ...(moods ? { format: MOOD_FORMAT } : {}) },
    /* A no-op while the conversation is under the model's minimum cacheable prefix. */
    cache_control: { type: "ephemeral" },
    system: systemPrompt(problem, persona),
    messages: toMessages(turns),
  });

  return streamAnswer(claude, moods);
}
