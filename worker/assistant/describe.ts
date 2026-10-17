import Anthropic from "@anthropic-ai/sdk";

/* What the window shows when the call fails. The caller has already proved the password, so naming the cause is no leak. APIConnectionError is itself an APIError, so it is checked first. */
export function describe(e: unknown): string {
  if (e instanceof Anthropic.APIConnectionError) return "Couldn't reach Anthropic. Try again in a moment.";
  if (e instanceof Anthropic.APIError) {
    switch (e.type) {
      case "authentication_error":
        return "Anthropic rejected the API key. Check the Worker's ANTHROPIC_API_KEY secret.";
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
