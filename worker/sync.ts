/* The sync endpoint: one row per sync code, holding the whole export blob.
 *
 * Deliberately a dumb store. Versioning and vetting stay client-side in
 * engine.normalize, exactly where they already live for import. The server
 * reads exactly two labels off the blob and nothing else: its schema version
 * (`v`) and the line it was last riding (`track`), each mirrored into its own
 * column. All it adds is last-write-wins: every payload carries the client's
 * `updatedAt`, and an older write loses, atomically, in the upsert's WHERE
 * clause. The loser gets the current row back in the response so the stale
 * device can adopt it instead of retrying forever.
 *
 * The `v` column is what makes the v1 -> v2 split safe to deploy. A tab that
 * was open across the deploy still runs the v1 build, and its next push would
 * otherwise overwrite a v2 blob — and every line but Google with it — just by
 * being newer. The same WHERE clause refuses any write whose schema is older
 * than the row's; the stale tab gets the v2 row back, can't read it, and parks
 * (sync's `held`) until it reloads into a build that can.
 *
 * Runs in the Worker (index.ts sends /api/state/<code> here) against a D1
 * binding named DB. The schema maintains itself: the table creates itself on
 * first contact ("no such table" -> CREATE -> retry once), and a table
 * created by an older deploy grows the new columns the same way ("no such
 * column" -> ALTER -> retry), so deploying still needs a database and a
 * binding, but no migration step.
 */

import { err, json } from "./http";

export interface SyncEnv {
  DB: D1Database;
}

interface Row {
  data: string;
  updated_at: number;
  v: number;
  track: string;
}

/* UUIDs and anything hand-typed within reason; blocks path games and junk. */
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{7,63}$/;

/* An export is a few KB today; 256 KB is "someone is not syncing progress". */
const MAX_BYTES = 256 * 1024;

const SCHEMA = `CREATE TABLE IF NOT EXISTS states (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  v INTEGER NOT NULL DEFAULT 1,
  track TEXT NOT NULL DEFAULT 'google'
)`;

/* What a table from an earlier deploy is missing, in order. Every row that
   predates a column is a v1 blob on the Google line, which is exactly what
   the defaults say. Each statement fails harmlessly ("duplicate column") on a
   table that already has its column. */
const MIGRATIONS = [
  "ALTER TABLE states ADD COLUMN v INTEGER NOT NULL DEFAULT 1",
  "ALTER TABLE states ADD COLUMN track TEXT NOT NULL DEFAULT 'google'",
];

/* Lines are short lowercase ids ("google", "aws"); anything else is noise. */
const TRACK_RE = /^[a-z][a-z0-9-]{0,23}$/;

async function migrate(db: D1Database): Promise<void> {
  for (const sql of MIGRATIONS) {
    try {
      await db.prepare(sql).run();
    } catch (e) {
      if (!String(e).includes("duplicate column")) throw e;
    }
  }
}

/* First request ever (or a fresh local dev database) has no table yet; the
   first request after a deploy that added columns finds them missing. Either
   way: fix the schema, retry once. */
async function withTable<T>(db: D1Database, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (e) {
    const msg = String(e);
    if (msg.includes("no such table")) {
      await db.prepare(SCHEMA).run();
    } else if (msg.includes("no such column") || msg.includes("has no column named")) {
      await migrate(db);
    } else {
      throw e;
    }
    return run();
  }
}

/* The two labels the server reads off a blob. A v1 blob has no track: it is
   the Google line's, by definition. */
function labels(data: object): { v: number; track: string } {
  const d = data as { v?: unknown; track?: unknown };
  const v = typeof d.v === "number" && Number.isInteger(d.v) && d.v > 0 ? d.v : 1;
  const track = typeof d.track === "string" && TRACK_RE.test(d.track) ? d.track : "google";
  return { v, track };
}

/* The code is the URL's last segment, whatever it holds; only ID_RE gets in. */
const id = (code: string): string | null => (ID_RE.test(code) ? code : null);

export async function getState(env: SyncEnv, code: string): Promise<Response> {
  const key = id(code);
  if (!key) return err(400, "bad sync code");

  const row = await withTable(env.DB, () =>
    env.DB.prepare("SELECT data, updated_at, v, track FROM states WHERE id = ?1")
      .bind(key)
      .first<Row>()
  );
  if (!row) return err(404, "no state under this code");

  try {
    return json(200, {
      updatedAt: row.updated_at,
      v: row.v,
      track: row.track,
      data: JSON.parse(row.data),
    });
  } catch {
    /* A corrupt row should read as "nothing here" so the client re-seeds it. */
    return err(404, "no state under this code");
  }
}

export async function putState(env: SyncEnv, code: string, request: Request): Promise<Response> {
  const key = id(code);
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

  const { v, track } = labels(data);

  /* The whole LWW rule, atomically: a newer stamp wins, an older one changes
     nothing, and so does an older schema, however new its stamp. A tied stamp
     wins only as a replay of the same bytes; another device's write at the
     same instant loses and adopts the row, so both devices end on one copy.
     meta.changes says which branch ran. */
  const result = await withTable(env.DB, () =>
    env.DB.prepare(
      `INSERT INTO states (id, data, updated_at, v, track) VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT(id) DO UPDATE SET
         data = excluded.data, updated_at = excluded.updated_at,
         v = excluded.v, track = excluded.track
       WHERE (excluded.updated_at > states.updated_at
              OR (excluded.updated_at = states.updated_at AND excluded.data = states.data))
         AND excluded.v >= states.v`
    )
      .bind(key, JSON.stringify(data), Math.floor(updatedAt), v, track)
      .run()
  );

  if (result.meta.changes > 0) return json(200, { applied: true, updatedAt: Math.floor(updatedAt) });

  /* Lost the race (or wrote an older schema): hand back the winner so the
     caller can adopt it — or, if it can't read it, park. */
  const row = await env.DB.prepare("SELECT data, updated_at, v, track FROM states WHERE id = ?1")
    .bind(key)
    .first<Row>();
  if (!row) return err(500, "write rejected but no row found");
  try {
    return json(200, {
      applied: false,
      updatedAt: row.updated_at,
      v: row.v,
      track: row.track,
      data: JSON.parse(row.data),
    });
  } catch {
    return err(500, "stored state is corrupt");
  }
}

/* No UI calls this; it exists so a leaked code can be cleaned up with curl. */
export async function deleteState(env: SyncEnv, code: string): Promise<Response> {
  const key = id(code);
  if (!key) return err(400, "bad sync code");
  await withTable(env.DB, () =>
    env.DB.prepare("DELETE FROM states WHERE id = ?1").bind(key).run()
  );
  return json(200, { deleted: true });
}
