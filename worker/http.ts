/* What every endpoint answers with: JSON, and never from a cache. Progress
 * must not come back stale from the edge, and neither may an error. */

export const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export const err = (status: number, error: string): Response => json(status, { error });
