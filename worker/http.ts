/* JSON, never cached: neither progress nor an error may come back stale from the edge. */
export const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export const err = (status: number, error: string): Response => json(status, { error });
