import Anthropic from "@anthropic-ai/sdk";
import type { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream";
import { createUIMessageStream, createUIMessageStreamResponse, type FinishReason, type UIMessageChunk } from "ai";
import { describe } from "./describe";
import { MoodedAnswer } from "./mood";
import type { Mood } from "../../shared/assistantContract";

const FINISH: Partial<Record<Anthropic.StopReason, FinishReason>> = {
  end_turn: "stop",
  max_tokens: "length",
  model_context_window_exceeded: "length",
  refusal: "content-filter",
};

/* Each text block becomes a text part; thinking blocks are skipped. With moods, the text is her JSON reply:
   the answer streams on as text, the mood goes ahead as message metadata. */
function translate(claude: MessageStream, moods: readonly Mood[] | null): ReadableStream<UIMessageChunk> {
  return new ReadableStream<UIMessageChunk>({
    async start(controller) {
      const open = new Set<number>();
      const reply = moods ? new MoodedAnswer(moods) : null;
      try {
        for await (const event of claude) {
          if (event.type === "content_block_start" && event.content_block.type === "text") {
            open.add(event.index);
            controller.enqueue({ type: "text-start", id: `t${event.index}` });
          } else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const { text, mood } = reply ? reply.push(event.delta.text) : { text: event.delta.text };
            if (mood) controller.enqueue({ type: "message-metadata", messageMetadata: { mood } });
            if (text) controller.enqueue({ type: "text-delta", id: `t${event.index}`, delta: text });
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
    /* A client that hangs up cancels this stream; abort the paid call instead of letting it finish unread. */
    cancel() {
      claude.abort();
    },
  });
}

export function streamAnswer(claude: MessageStream, moods: readonly Mood[] | null = null): Response {
  const answer = translate(claude, moods);
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
}
