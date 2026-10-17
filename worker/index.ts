import { ask, type AssistantEnv } from "./assistant";
import { err } from "./http";
import { deleteState, getState, putState, type SyncEnv } from "./sync";

interface Env extends SyncEnv, AssistantEnv {
  ASSETS: Fetcher;
}

const STATE = /^\/api\/state\/([^/]+)$/;

const notAllowed = (allow: string): Response => new Response(null, { status: 405, headers: { allow } });

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);
    /* Files in dist/ are served before the Worker runs; /api/* and paths with no file behind them get here. */
    if (!pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    const code = STATE.exec(pathname)?.[1];
    if (code !== undefined) {
      switch (request.method) {
        case "GET":
          return getState(env, code);
        case "PUT":
          return putState(env, code, request);
        case "DELETE":
          return deleteState(env, code);
      }
      return notAllowed("GET, PUT, DELETE");
    }

    if (pathname === "/api/assistant") {
      return request.method === "POST" ? ask(request, env) : notAllowed("POST");
    }

    return err(404, "no such endpoint");
  },
} satisfies ExportedHandler<Env>;
