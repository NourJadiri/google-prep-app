/* The Worker: the app's two endpoints, in front of its static files.
 *
 * Everything in dist/ is served before this runs (wrangler.jsonc's assets),
 * so what reaches it is /api/* (run_worker_first) and paths with no file
 * behind them, which go back to the assets binding for its 404. Each endpoint
 * is its own module and declares the bindings it reads; this file only maps
 * paths and methods onto them, the way Pages did from file names and
 * onRequest exports.
 */

import { ask, type AssistantEnv } from "./assistant";
import { err } from "./http";
import { deleteState, getState, putState, type SyncEnv } from "./sync";

interface Env extends SyncEnv, AssistantEnv {
  ASSETS: Fetcher;
}

/* /api/state/<code>: one path segment, as Pages' [id].ts had it. */
const STATE = /^\/api\/state\/([^/]+)$/;

const notAllowed = (allow: string): Response => new Response(null, { status: 405, headers: { allow } });

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);
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
