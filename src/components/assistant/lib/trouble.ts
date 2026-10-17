import { APICallError } from "ai";

export interface Trouble {
  /** locked: password refused. setup: no endpoint or no secrets here. full: too long to send. */
  kind: "locked" | "setup" | "full" | "other";
  text: string;
}

export function troubleOf(e: Error): Trouble {
  if (APICallError.isInstance(e)) {
    switch (e.statusCode) {
      case 401:
        return { kind: "locked", text: "That password didn't work." };
      case 503:
        return {
          kind: "setup",
          text: "Bana isn't set up on this deployment. It needs ANTHROPIC_API_KEY and ASSISTANT_PASSWORD as secrets on the Cloudflare Worker.",
        };
      case 404:
      case 405:
        return { kind: "setup", text: "Bana has no endpoint here. Locally, run the app through wrangler dev (see the README)." };
      case 413:
        return { kind: "full", text: "This conversation is too long to send. Start a new one." };
    }
    let said: unknown;
    try {
      said = (JSON.parse(e.responseBody ?? "") as { error?: unknown }).error;
    } catch {
      said = undefined;
    }
    return { kind: "other", text: typeof said === "string" ? `The server said: ${said}.` : `The server answered ${e.statusCode ?? "with an error"}.` };
  }
  if (e instanceof TypeError) return { kind: "other", text: "Couldn't reach the server. Check the connection and retry." };
  /* Errors from inside the stream arrive already worded by the Worker. */
  return { kind: "other", text: e.message || "Something went wrong." };
}
