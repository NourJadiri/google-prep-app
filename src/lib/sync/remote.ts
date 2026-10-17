import type { ProbeResult } from "./types";

export interface RemoteRow {
  updatedAt: number;
  data: unknown;
}

export interface PushReply {
  applied: boolean;
  /** The winning row's stamp when the push lost; null if the server sent none. */
  updatedAt: number | null;
  data: unknown;
}

const rowUrl = (code: string) => `/api/state/${encodeURIComponent(code)}`;

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object";

const finite = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) ? x : null);

/** The row under `code`, or null if there is none yet. Throws on anything unusable. */
export async function getRow(code: string): Promise<RemoteRow | null> {
  const res = await fetch(rowUrl(code), { method: "GET" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`pull ${res.status}`);
  const out: unknown = await res.json();
  if (!isObj(out) || typeof out["updatedAt"] !== "number") throw new Error("pull: bad response");
  return { updatedAt: out["updatedAt"], data: out["data"] };
}

export async function putRow(code: string, body: string, keepalive: boolean): Promise<PushReply> {
  const res = await fetch(rowUrl(code), {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body,
    keepalive,
  });
  if (!res.ok) throw new Error(`push ${res.status}`);
  const out: unknown = await res.json();
  if (!isObj(out)) throw new Error("push: bad response");
  return { applied: out["applied"] === true, updatedAt: finite(out["updatedAt"]), data: out["data"] };
}

/** One cheap GET for the receive panel's poll. Kept out of the status machinery: a poll against a code this device hasn't joined must not colour its own sync status. */
export async function probe(code: string): Promise<ProbeResult> {
  try {
    const res = await fetch(rowUrl(code), { method: "GET" });
    if (res.status === 404) return "none";
    if (!res.ok) return "unreachable";
    const out: unknown = await res.json();
    if (!isObj(out)) return "unreachable";
    const at = finite(out["updatedAt"]);
    return at === null ? "unreachable" : { at };
  } catch {
    return "unreachable";
  }
}
