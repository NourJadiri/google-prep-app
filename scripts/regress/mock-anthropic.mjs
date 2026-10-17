// A stand-in for api.anthropic.com's POST /v1/messages (streaming), for
// exercising the Worker locally. Logs each request it gets as one JSON line.
//   "AUTHFAIL" in the question -> 401 authentication_error
//   "SLOW" in the question     -> 40 deltas, 250 ms apart (to test client hang-ups)
//   "MARKDOWN" in the question -> a markdown answer (fence, list, links, raw html, image) in small deltas
//   anything else              -> a thinking block, then "Use a hash map." in two deltas
import http from "node:http";
import fs from "node:fs";

const PORT = Number(process.argv[2] ?? 8788);
const LOG = process.argv[3] ?? "mock.log";
const log = (o) => fs.appendFileSync(LOG, JSON.stringify(o) + "\n");

const sse = (res, event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

http
  .createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", async () => {
      let body = {};
      try { body = JSON.parse(raw); } catch {}
      const last = body.messages?.at?.(-1)?.content ?? "";
      const question = typeof last === "string" ? last : JSON.stringify(last);
      log({ at: Date.now(), method: req.method, url: req.url, apiKey: req.headers["x-api-key"], body });

      if (question.includes("AUTHFAIL")) {
        res.writeHead(401, { "content-type": "application/json", "request-id": "req_mock" });
        res.end(JSON.stringify({ type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } }));
        return;
      }

      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", "request-id": "req_mock" });
      let closed = false;
      res.on("close", () => { closed = true; log({ at: Date.now(), event: "client-closed", finished: res.writableFinished }); });

      sse(res, "message_start", { type: "message_start", message: { id: "msg_mock", type: "message", role: "assistant", model: body.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 42, output_tokens: 1 } } });
      sse(res, "content_block_start", { type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "", signature: "" } });
      sse(res, "content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "signature_delta", signature: "c2ln" } });
      sse(res, "content_block_stop", { type: "content_block_stop", index: 0 });
      sse(res, "content_block_start", { type: "content_block_start", index: 1, content_block: { type: "text", text: "" } });

      const MARKDOWN = [
        "Try a **dict**:\n\n",
        "```python\n",
        "def two_sum(nums, target):\n",
        "    seen = {}  # value -> index\n",
        "    return seen\n",
        "```\n\n",
        "- first, `seen[x] = i`\n",
        "- then [the docs](https://docs.python.org/3/) and [bad](javascript:alert(1))\n\n",
        "<script>alert(1)</script> ![pic](https://example.com/x.png)\n",
      ];
      const deltas = question.includes("MARKDOWN")
        ? MARKDOWN
        : question.includes("SLOW")
          ? Array.from({ length: 40 }, (_, i) => `chunk ${i} `)
          : ["Use a ", "hash map."];
      for (const text of deltas) {
        if (closed) { log({ at: Date.now(), event: "stopped-early" }); return; }
        sse(res, "content_block_delta", { type: "content_block_delta", index: 1, delta: { type: "text_delta", text } });
        await sleep(question.includes("SLOW") ? 250 : 20);
      }
      sse(res, "content_block_stop", { type: "content_block_stop", index: 1 });
      sse(res, "message_delta", { type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 12 } });
      sse(res, "message_stop", { type: "message_stop" });
      res.end();
      log({ at: Date.now(), event: "stream-finished" });
    });
  })
  .listen(PORT, "127.0.0.1", () => console.log(`mock anthropic on http://127.0.0.1:${PORT}`));
