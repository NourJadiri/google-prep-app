/* The sync endpoint: one row per sync code, holding the whole export blob.
 *
 * Deliberately a dumb store. The server never looks inside `data` — versioning
 * and vetting stay client-side in engine.normalize, exactly where they already
 * live for import. All the server adds is last-write-wins: every payload
 * carries the client's `updatedAt`, and an older write loses, atomically, in
 * the upsert's WHERE clause. The loser gets the current row back in the
 * response so the stale device can adopt it instead of retrying forever.
 *
 * Runs as a Cloudflare Pages Function against a D1 binding named DB. The table
 * creates itself on first contact ("no such table" → CREATE → retry once), so
 * deploying needs a database and a binding, but no migration step.
 */

interface Env {
  DB: D1Database;
}

interface Row {
  data: string;
  updated_at: number;
}

/* UUIDs and anything hand-typed within reason; blocks path games and junk. */
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{7,63}$/;

/* An export is a few KB today; 256 KB is "someone is not syncing progress". */
const MAX_BYTES = 256 * 1024;

const SCHEMA = `CREATE TABLE IF NOT EXISTS states (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
)`;

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      /* Progress must never come back stale from an edge cache. */
      "cache-control": "no-store",
    },
  });

const err = (status: number, error: string): Response => json(status, { error });

/* First request ever (or a fresh local dev database) has no table yet. */
async function withTable<T>(db: D1Database, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (e) {
    if (!String(e).includes("no such table")) throw e;
    await db.prepare(SCHEMA).run();
    return run();
  }
}

function id(params: Record<string, string | string[]>): string | null {
  const raw = params["id"];
  return typeof raw === "string" && ID_RE.test(raw) ? raw : null;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const key = id(params);
  if (!key) return err(400, "bad sync code");

  const row = await withTable(env.DB, () =>
    env.DB.prepare("SELECT data, updated_at FROM states WHERE id = ?1")
      .bind(key)
      .first<Row>()
  );
  if (!row) return err(404, "no state under this code");

  try {
    return json(200, { updatedAt: row.updated_at, data: JSON.parse(row.data) });
  } catch {
    /* A corrupt row should read as "nothing here" so the client re-seeds it. */
    return err(404, "no state under this code");
  }
};

export const onRequestPut: PagesFunction<Env> = async ({ env, params, request }) => {
  const key = id(params);
  if (!key) return err(400, "bad sync code");

  const text = await request.text();
  if (text.length > MAX_BYTES) return err(413, "payload too large");

  let updatedAt: number;
  let data: unknown;
  try {
    const body: unknown = JSON.parse(text);
    if (!body || typeof body !== "object") throw new Error("not an object");
    ({ updatedAt, data } = body as { updatedAt: number; data: unknown });
  } catch {
    return err(400, "body must be JSON");
  }
  if (typeof updatedAt !== "number" || !Number.isFinite(updatedAt) || updatedAt <= 0) {
    return err(400, "updatedAt must be a positive number");
  }
  if (!data || typeof data !== "object") return err(400, "data must be an object");

  /* The whole LWW rule, atomically: a tied or newer stamp wins, an older one
     changes nothing. meta.changes says which branch ran. */
  const result = await withTable(env.DB, () =>
    env.DB.prepare(
      `INSERT INTO states (id, data, updated_at) VALUES (?1, ?2, ?3)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
       WHERE excluded.updated_at >= states.updated_at`
    )
      .bind(key, JSON.stringify(data), Math.floor(updatedAt))
      .run()
  );

  if (result.meta.changes > 0) return json(200, { applied: true, updatedAt: Math.floor(updatedAt) });

  /* Lost the race: hand back the winner so the caller can adopt it. */
  const row = await env.DB.prepare("SELECT data, updated_at FROM states WHERE id = ?1")
    .bind(key)
    .first<Row>();
  if (!row) return err(500, "write rejected but no row found");
  try {
    return json(200, { applied: false, updatedAt: row.updated_at, data: JSON.parse(row.data) });
  } catch {
    return err(500, "stored state is corrupt");
  }
};

/* No UI calls this; it exists so a leaked code can be cleaned up with curl. */
export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const key = id(params);
  if (!key) return err(400, "bad sync code");
  await withTable(env.DB, () =>
    env.DB.prepare("DELETE FROM states WHERE id = ?1").bind(key).run()
  );
  return json(200, { deleted: true });
};
