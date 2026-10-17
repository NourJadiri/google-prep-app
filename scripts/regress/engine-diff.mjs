// engine-diff.mjs: differential test for the domain engine (src/lib/engine and src/lib/dates).
//
//   node scripts/regress/engine-diff.mjs [git-ref] [--steps=24000] [--seed=1]
//
// Bundles the engine from <git-ref> (default HEAD, taken with `git archive`) and from this checkout with esbuild,
// then plays the same seeded random game on both: ticks, workspace passes, rituals, line switches, whole Metro
// runs (right and wrong answers, perfect runs, Redemption), normalize() on fuzzed blobs (v1, v2, garbage, partial,
// wrong types, extra keys) and a calendar that moves 0-2 days a step, so streaks happen. After every step it
// compares what each engine returned: data, celebrations and run as JSON, whether a no-op handed back the very
// object it was given, which nested objects the result shares with its input, how many random numbers were drawn,
// and every selector on the resulting state. Exits 1 at the first difference and names the step.
// Only exports present in both trees are driven; the ones missing from the new tree are listed.

import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const RealDate = Date;
const DAY_MS = 86400000;
const EPOCH = RealDate.UTC(2026, 0, 1);

const argv = process.argv.slice(2);
const flag = (name, dflt) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.slice(name.length + 3)) : dflt;
};
const REF = argv.find((a) => !a.startsWith("--")) ?? "HEAD";
const STEPS = flag("steps", 24000);
const SEED = flag("seed", 1);

// Loading: the engine from two trees, and the data both play on.

const ENGINE_ENTRY = `export * from "./src/lib/engine"; export * as dates from "./src/lib/dates";`;
const CATALOG_ENTRY = `
export { TRACKS, TRACK_IDS, PROB_INDEX, DAY_INDEX } from "./src/data/tracks";
export { Q } from "./src/data/questions";
export { BADGES } from "./src/data/meta";`;

async function load(root, entry, tag) {
  const out = await build({
    stdin: { contents: entry, resolveDir: root, sourcefile: "engine-diff-entry.ts", loader: "ts" },
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
    logLevel: "silent",
  });
  // The tag keeps two identical bundles (HEAD against an unchanged tree) from sharing one module instance.
  const code = out.outputFiles[0].text + `\n// ${tag}`;
  return import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
}

function extractRef(ref, into) {
  const sha = execFileSync("git", ["-C", ROOT, "rev-parse", "--verify", `${ref}^{commit}`], { encoding: "utf8" }).trim();
  const tar = path.join(into, "src.tar");
  execFileSync("git", ["-C", ROOT, "archive", "--format=tar", "-o", tar, sha, "src"]);
  execFileSync("tar", ["-x", "-f", tar, "-C", into]);
  return sha;
}

const { TRACKS, TRACK_IDS, PROB_INDEX, DAY_INDEX, Q, BADGES } = await load(ROOT, CATALOG_ENTRY, "catalog");
const PROBS = Object.entries(PROB_INDEX);
const PROB_IDS = PROBS.map(([id]) => id);
const DAY_IDS = Object.keys(DAY_INDEX);
const QIDS = Q.map((q) => q.id);
const DECKS = ["mix", "redo", "graphs", "bt", "dp", "ds"];

// Small tools.

function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const counted = (rng) => {
  const f = () => (f.n++, rng());
  f.n = 0;
  return f;
};

const int = (r, n) => Math.floor(r() * n);
const chance = (r, p) => r() < p;
const pick = (r, list) => list[int(r, list.length)];
const weighted = (r, table) => {
  let x = r() * table.reduce((sum, [, w]) => sum + w, 0);
  for (const [value, w] of table) if ((x -= w) < 0) return value;
  return table[table.length - 1][0];
};
const subset = (r, ids, share) => ids.filter(() => chance(r, share));

function sample(r, ids, k) {
  const a = [...ids];
  for (let i = a.length - 1; i > 0; i--) {
    const j = int(r, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, k);
}

// undefined, NaN, Infinity and -0 survive as markers, so JSON.stringify can tell them apart.
const ser = (v) =>
  JSON.stringify(v, (_key, x) =>
    x === undefined ? "\0undefined" : typeof x === "number" && (!Number.isFinite(x) || Object.is(x, -0)) ? "\0" + String(x) : x
  );

// The paths where `after` holds the very object `before` held: how much a result shares with its input.
function shared(before, after, at = "") {
  if (!after || typeof after !== "object" || !before || typeof before !== "object") return [];
  if (before === after) return [at || "."];
  return Object.keys(after).flatMap((k) => shared(before[k], after[k], at + "/" + k));
}

const dayStr = (n) => new RealDate(EPOCH + n * DAY_MS).toISOString().slice(0, 10);
const dayNum = (str) => Math.round((new RealDate(str).getTime() - EPOCH) / DAY_MS);

// Calls made without options read the clock and Math.random; both are pinned per call.
const clock = { ms: RealDate.now() };
globalThis.Date = class extends RealDate {
  constructor(...args) {
    super(...(args.length ? args : [clock.ms]));
  }
  static now() {
    return clock.ms;
  }
};
const setClock = (today) => {
  const [y, m, d] = today.split("-").map(Number);
  clock.ms = new RealDate(y, m - 1, d, 12).getTime();
};

// Blobs: what the engine might be asked to normalize.

const WEIRD = [undefined, null, NaN, Infinity, -Infinity, -1, 0, 0.5, 3.7, 1e21, "5", "", "google", [], [1, "a", null], {}, { a: 1 }, true, false];
const EXTRA_KEYS = ["zz", "future", "__proto__", "v", "track", "peak", "uncleared", "xp", "done", "tracks", "quiz", "extra"];
const ODD_NUMBERS = [3.7, 0.5, 2.5, -0.5, -3.2, 99.4999, 7.5, 1e21, NaN, Infinity, -Infinity, "5", null];
const CROSSABLE = ["green25", "metro100", "bugs20", "ritual5", "streak3", "streak7", "perfect"];
const GARBAGE = [
  null, undefined, 0, 1, "x", "{\"v\":2}", true, [], [1, 2], {}, { v: 0 }, { v: 3 }, { v: "2" }, { v: 2.5 }, { v: null },
  { v: 2, tracks: null }, { v: 2, tracks: [] }, { v: 2, tracks: { google: null, aws: 5 } }, { v: 2, track: "nope" },
  { v: 1, done: [], rituals: "s", xp: "12" }, { v: 1 }, { v: 1, xp: 99999, done: { zz: true }, quiz: [], streak: 4, badges: [] },
  JSON.parse('{"v":2,"__proto__":{"v":1},"track":"aws"}'),
];

// A plausible v2 blob; half the time it sits just short of a rank, a badge or a station clear.
function richData(r, today) {
  const near = chance(r, 0.5);
  const tracks = {};
  let toAccept = 21 + int(r, 4);
  for (const id of TRACK_IDS) {
    const mine = PROBS.filter(([, ref]) => ref.track === id).map(([pid]) => pid);
    const foreign = PROB_IDS.filter((pid) => PROB_INDEX[pid].track !== id);
    const days = DAY_IDS.filter((d) => DAY_INDEX[d].track === id);
    const edge = pick(r, TRACKS[id].ranks)[1];
    const accepts = id === TRACK_IDS[TRACK_IDS.length - 1] ? toAccept : int(r, toAccept + 1);
    toAccept -= accepts;
    const stamp = () => 1700000000000 + int(r, 1e9);
    const strays = () => [...subset(r, foreign, 0.1), "gone-1", "gone-2"];
    const t = {
      xp: near ? Math.max(0, edge + int(r, 9) - 6) : weighted(r, [[0, 1], [int(r, 200), 2], [int(r, 3200), 3]]),
      done: Object.fromEntries(subset(r, mine, r()).map((p) => [p, true])),
      rituals: Object.fromEntries(subset(r, days, near ? 0.17 : r()).map((d) => [d, dayStr(int(r, 400))])),
      accepted: Object.fromEntries((near ? sample(r, mine, accepts) : subset(r, mine, r() * 0.6)).map((p) => [p, stamp()])),
    };
    if (chance(r, 0.3)) for (const p of strays()) t.done[p] = true;
    if (chance(r, 0.5)) for (const p of strays()) t.accepted[p] = stamp();
    if (chance(r, 0.2)) t.peak = t.xp + int(r, 400);
    if (chance(r, 0.2)) t.uncleared = Object.fromEntries(subset(r, days, 0.2).map((d) => [d, true]));
    tracks[id] = t;
  }
  const answered = near ? 90 + int(r, 10) : int(r, 130);
  const badgeIds = BADGES.map((b) => b.id).filter((b) => !near || !CROSSABLE.includes(b));
  const now = dayNum(today);
  return {
    v: 2,
    track: pick(r, TRACK_IDS),
    tracks,
    quiz: {
      answered,
      correct: int(r, answered + 1),
      perQ: Object.fromEntries(subset(r, QIDS, r()).map((q) => [q, { seen: 1 + int(r, 6), right: int(r, 4) }])),
      missed: subset(r, QIDS, r() * 0.15),
      bestStreak: int(r, 12),
      sessions: int(r, 30),
      perfect: int(r, 4),
      bugRight: near ? 17 + int(r, 4) : int(r, 25),
    },
    badges: Object.fromEntries(subset(r, badgeIds, r() * 0.7).map((b) => [b, 1700000000000 + int(r, 1e9)])),
    streak: {
      last: pick(r, [today, dayStr(now - 1), dayStr(now + 1 + int(r, 5)), "", "2020-01-01"]),
      cur: int(r, 8),
      best: int(r, 12),
    },
  };
}

// Sets one key somewhere inside the blob to a wrong type, or adds or removes one.
function mutate(r, blob) {
  let node = blob;
  for (let depth = 0; depth < 4; depth++) {
    const kids = Object.values(node).filter((v) => v && typeof v === "object");
    if (!kids.length || chance(r, 0.4)) break;
    node = pick(r, kids);
  }
  const keys = Object.keys(node);
  const roll = r();
  if (roll < 0.3 || !keys.length) node[pick(r, EXTRA_KEYS)] = structuredClone(pick(r, WEIRD));
  else if (roll < 0.5) delete node[pick(r, keys)];
  else node[pick(r, keys)] = structuredClone(pick(r, WEIRD));
}

// Numbers a hand-edited or damaged export could hold where the engine expects a count.
function oddNumbers(r, blob) {
  const t = blob.v === 1 ? blob : blob.tracks?.[pick(r, TRACK_IDS)];
  if (!t || typeof t !== "object") return;
  const key = pick(r, ["xp", "xp", "peak", "accepted", "accepted"]);
  if (key === "accepted") t.accepted = { ...t.accepted, [pick(r, PROB_IDS)]: pick(r, ODD_NUMBERS) };
  else t[key] = pick(r, ODD_NUMBERS);
}

function fuzzBlob(r, current, today) {
  const kind = weighted(r, [["current", 3], ["rich", 3], ["v1", 2], ["garbage", 2], ["partial", 2]]);
  if (kind === "garbage") return structuredClone(pick(r, GARBAGE));
  let blob;
  if (kind === "v1") {
    const google = richData(r, today).tracks.google;
    const quiz = richData(r, today).quiz;
    blob = { v: 1, xp: google.xp, done: google.done, rituals: google.rituals, quiz, badges: { first: 5 }, streak: { last: today, cur: 2, best: 3 } };
  } else {
    blob = kind === "current" ? structuredClone(current) : richData(r, today);
  }
  if (kind === "partial") for (const k of Object.keys(blob)) if (chance(r, 0.3)) delete blob[k];
  if (chance(r, 0.4)) oddNumbers(r, blob);
  for (let n = int(r, chance(r, 0.4) ? 5 : 1); n > 0; n--) mutate(r, blob);
  return blob;
}

// The game: what to do next, chosen from the base engine's state (both engines hold the same one).
// Every few hundred steps the state is swapped for a fresh or fuzzed one; some of those stretches
// mostly tick problems forward ("grind"), so whole lines get cleared.

function nextAction(r, g, api, data, session) {
  const roll = r();
  if (roll < 1 / 450) {
    g.grind = chance(r, 0.35);
    return { kind: "normalize", adopt: true, blob: chance(r, 0.2) ? api.blank() : fuzzBlob(r, data, g.today) };
  }
  if (roll < 0.03) return { kind: "normalize", adopt: chance(r, 0.3), blob: fuzzBlob(r, data, g.today) };

  const kind = weighted(r, g.grind
    ? [["toggleProb", 50], ["acceptProb", 10], ["toggleRitual", 10], ["setTrack", 3], ["quiz", 20]]
    : [["toggleProb", 22], ["acceptProb", 7], ["toggleRitual", 9], ["setTrack", 3], ["quiz", 43], ["quit", 0.5]]);
  const track = pick(r, TRACK_IDS);

  if (kind === "toggleProb" || kind === "acceptProb") {
    const how = weighted(r, g.grind
      ? [["forward", 9], ["random", 0.5], ["untick", 0.5]]
      : [["forward", 5], ["random", 3], ["untick", 2], ["stale", 0.3]]);
    const nextUndone = PROBS.find(([pid, ref]) => ref.track === track && !data.tracks[track].done[pid])?.[0];
    const done = Object.keys(data.tracks[track].done);
    const id =
      how === "forward" ? nextUndone ?? pick(r, PROB_IDS) :
      how === "untick" && done.length ? pick(r, done) :
      how === "stale" ? "gone-" + int(r, 3) :
      pick(r, PROB_IDS);
    return { kind, id };
  }
  if (kind === "toggleRitual") return { kind, id: chance(r, 0.03) ? "gone-day" : pick(r, DAY_IDS) };
  if (kind === "setTrack") return { kind, track };
  if (kind === "quit") return { kind };

  if (chance(r, 0.04)) return pick(r, [{ kind: "next" }, { kind: "answer", slot: 0 }, { kind: "start", deck: pick(r, DECKS) }]);
  if (!session || session.phase === "done") {
    g.skill = pick(r, [1, 1, 0.9, 0.7, 0.4]);
    return chance(r, 0.05) ? { kind: "quit" } : { kind: "start", deck: pick(r, DECKS) };
  }
  if (session.phase === "reveal") return { kind: "next" };
  const card = api.currentCard(session);
  const rightSlot = card ? session.order.findIndex((o) => o === card.a) : 0;
  const slot = chance(r, 0.03) ? pick(r, [-1, 4, 17, 2.5, NaN]) : chance(r, g.skill) ? rightSlot : int(r, 4);
  return { kind: "answer", slot };
}

// How a call is made: with all options, none (the clock and Math.random decide), or some.
function withCallShape(r, g, step, act) {
  const shape = weighted(r, [["full", 12], ["bare", 3], ["partial", 3]]);
  const odd = (v, replacement) => (chance(r, 0.01) ? replacement : v);
  const full = {
    today: odd(g.today, ""),
    now: odd(EPOCH + g.day * DAY_MS + DAY_MS / 2 + step, 0),
    rng: true,
  };
  act.opts =
    shape === "bare" ? "bare" :
    shape === "full" ? full :
    Object.fromEntries(Object.entries(full).filter(() => chance(r, 0.5)));
  act.clockDay = g.today;
  act.rseed = int(r, 2 ** 31);
  act.aseed = int(r, 2 ** 31);
  return act;
}

// Applies one action to one engine's state, noting what the engine returned in `rec`.
function perform(p, act, opts, rec) {
  const { api } = p;
  const dataIn = p.data;
  const sessionIn = p.session;

  switch (act.kind) {
    case "toggleProb":
    case "acceptProb":
    case "toggleRitual": {
      const res = api[act.kind](dataIn, act.id, opts);
      p.data = res.data;
      rec.fx = ser(res.fx);
      break;
    }
    case "setTrack":
      p.data = api.setTrack(dataIn, act.track);
      break;
    case "start": {
      const res = api.startSession(dataIn, act.deck, opts);
      if (res.session) p.session = res.session;
      rec.fx = ser(res.fx);
      rec.ret = ser(res.session);
      break;
    }
    case "answer":
    case "next": {
      const res = act.kind === "answer" ? api.answerCard(dataIn, sessionIn, act.slot, opts) : api.nextCard(dataIn, sessionIn, opts);
      p.data = res.data;
      p.session = res.session;
      rec.fx = ser(res.fx);
      rec.sameSession = res.session === sessionIn;
      rec.shareSession = shared(sessionIn, res.session).join();
      break;
    }
    case "quit":
      p.session = null;
      break;
    case "normalize": {
      const blob = structuredClone(act.blob);
      const out = api.normalize(blob);
      rec.ret = ser({ out, isExport: api.isExport(blob), blobAfter: ser(blob), same: out === blob, shares: shared(blob, out) });
      if (act.adopt) {
        p.data = out;
        p.session = null;
      }
      break;
    }
  }
}

// Runs one action on one engine and records everything worth comparing. A throw is a result too.
function play(p, act) {
  const dataIn = p.data;
  const sessionIn = p.session;
  const dataBefore = ser(dataIn);
  const sessionBefore = ser(sessionIn);
  const ambient = counted(prng(act.aseed));
  const rng = counted(prng(act.rseed));
  setClock(act.clockDay);
  Math.random = ambient;
  const opts = act.opts === "bare" ? undefined : { ...act.opts, ...(act.opts.rng ? { rng } : {}) };
  const rec = { threw: "-", fx: "-", ret: "-", sameData: "-", sameSession: "-", shareData: "-", shareSession: "-" };

  try {
    perform(p, act, opts, rec);
  } catch (err) {
    rec.threw = err instanceof Error ? err.message : String(err);
  }
  if (act.kind !== "normalize" && act.kind !== "quit") {
    rec.sameData = p.data === dataIn;
    rec.shareData = shared(dataIn, p.data).join();
  }
  return {
    ...rec,
    data: ser(p.data),
    session: ser(p.session),
    inputIntact: ser(dataIn) === dataBefore && ser(sessionIn) === sessionBefore,
    draws: `${rng.n}+${ambient.n}`,
  };
}

// Every selector the UI uses, on the player's current state.
function selectors({ api, data, session }) {
  const s = {};
  for (const id of [undefined, ...TRACK_IDS]) {
    s["progressOf " + id] = ser(api.progressOf(data, id));
    s["focusDay " + id] = api.focusDay(data, id).id;
    s["stationsCleared " + id] = api.stationsCleared(data, id);
    s["problemsDone " + id] = api.problemsDone(data, id);
    s["ritualsLogged " + id] = api.ritualsLogged(data, id);
  }
  s.trackOf = api.trackOf(data).id;
  s.hasAnyProgress = api.hasAnyProgress(data);
  s.progressSummary = api.progressSummary(data);
  s.accuracy = api.accuracy(data);
  s.isExport = api.isExport(data);
  for (const deck of DECKS) {
    s["deckStat " + deck] = ser(api.deckStat(data, deck));
    s["stopsFor " + deck] = api.stopsFor(data, deck);
  }
  for (const id of TRACK_IDS) {
    const ranks = api.trackOf({ ...data, track: id }).ranks;
    s["rankProgress " + id] = ser(api.rankProgress(ranks, data.tracks[id].xp));
    s["rankIdx " + id] = api.rankIdx(ranks, data.tracks[id].xp);
  }
  s.currentCard = ser(session && api.currentCard(session));
  return s;
}

// Constants and pure helpers, compared once before the game starts.
function statics(api) {
  const out = { MOCK_SECONDS: api.MOCK_SECONDS, blank: ser(api.blank()), multiplier: [], fmtT: [], runResultCopy: [], ranks: [], dates: [] };
  for (let n = 0; n < 14; n++) out.multiplier.push(api.multiplier(n));
  for (const s of [0, 1, 9, 59, 60, 61, 599, 1500, 3599, 3600, 5999, 6000, 86399]) out.fmtT.push(api.fmtT(s));
  for (const id of TRACK_IDS) {
    const track = api.trackOf({ ...api.blank(), track: id });
    for (let n = 0; n <= 12; n++) {
      for (let right = 0; right <= n; right++) out.runResultCopy.push(api.runResultCopy(track, right, n));
    }
    const top = track.ranks[track.ranks.length - 1][1];
    const xps = [-50, top + 500, ...track.ranks.flatMap(([, x]) => [x - 1, x, x + 1])];
    for (let x = 0; x <= top + 100; x += 7) xps.push(x);
    for (const x of xps) out.ranks.push([api.rankIdx(track.ranks, x), ser(api.rankProgress(track.ranks, x))]);
  }
  for (const [y, m, d] of [[2026, 0, 1], [2026, 6, 31], [2024, 1, 29], [2025, 11, 31], [2026, 2, 8], [2026, 9, 25], [2030, 5, 9]]) {
    for (const [hh, mm] of [[12, 0], [0, 5], [23, 55]]) out.dates.push(api.dates.todayStr(new RealDate(y, m, d, hh, mm)));
  }
  const spans = [["2026-07-31", "2026-08-01"], ["2025-12-31", "2026-01-01"], ["2024-02-28", "2024-03-01"], ["2026-03-07", "2026-03-09"],
    ["2026-10-24", "2026-10-26"], ["2026-05-05", "2026-05-05"], ["2026-05-06", "2026-05-05"], ["", "2026-05-05"]];
  for (const [a, b] of spans) out.dates.push(api.dates.daysBetween(a, b));
  return out;
}

// Comparing.

const show = (v) => (v !== null && typeof v === "object" ? ser(v) : String(v));

function firstDifference(a, b) {
  const x = show(a);
  const y = show(b);
  let i = 0;
  while (i < x.length && x[i] === y[i]) i++;
  const around = (s) => (i > 60 ? "…" : "") + s.slice(Math.max(0, i - 60), i + 140);
  return `base: ${around(x)}\n    new:  ${around(y)}`;
}

function compare(base, next) {
  for (const key of Object.keys({ ...base, ...next })) {
    if (show(base[key]) !== show(next[key])) return { field: key, text: firstDifference(base[key], next[key]) };
  }
  return null;
}

const describe = (act) =>
  JSON.stringify(act.kind === "normalize" ? { ...act, blob: ser(act.blob).slice(0, 240) } : act);

const fxLabel = (f) =>
  f.kind === "confetti" ? "confetti " + f.n :
  f.msg.startsWith("Badge — ") ? "toast badge" :
  f.msg.startsWith("Rank up") ? "toast rank-up" :
  f.msg.endsWith(" cleared") ? "toast station" :
  /^\+\d+ XP/.test(f.msg) ? "toast xp" : "toast other";

// Main.

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "engine-diff-"));
let mismatch = false;
try {
  let sha;
  try {
    sha = extractRef(REF, tmp);
  } catch {
    fs.rmSync(tmp, { recursive: true, force: true });
    console.error(`engine-diff: cannot read src/ at git ref "${REF}"`);
    process.exit(2);
  }
  const [baseApi, newApi] = await Promise.all([load(tmp, ENGINE_ENTRY, "base"), load(ROOT, ENGINE_ENTRY, "new")]);
  const base = { api: baseApi, data: baseApi.blank(), session: null };
  const next = { api: newApi, data: newApi.blank(), session: null };

  const report = (step, act, diff) => {
    mismatch = true;
    console.error(`\nMISMATCH at step ${step} (seed ${SEED}) after ${describe(act)}\n  ${diff.field}\n    ${diff.text}`);
  };

  const staticDiff = compare(statics(baseApi), statics(newApi));
  if (staticDiff) report(0, { kind: "statics" }, staticDiff);

  const r = prng(SEED);
  const g = { day: 0, today: dayStr(0), skill: 1, grind: false };
  const tally = {};
  const count = (key) => (tally[key] = (tally[key] ?? 0) + 1);
  const awarded = new Set();

  let step = 0;
  while (step < STEPS && !mismatch) {
    step++;
    g.day += weighted(r, [[0, 4], [1, 4], [2, 2], [-2, 0.03]]);
    g.today = dayStr(g.day);
    const act = withCallShape(r, g, step, nextAction(r, g, baseApi, base.data, base.session));

    const baseRun = play(base, act);
    const nextRun = play(next, act);
    const diff = compare(baseRun, nextRun) ?? compare(selectors(base), selectors(next));
    if (diff) {
      report(step, act, diff);
      break;
    }

    count(act.kind);
    if (baseRun.threw !== "-") count("threw in both: " + baseRun.threw.slice(0, 50));
    for (const f of JSON.parse(baseRun.fx === "-" ? "[]" : baseRun.fx)) {
      if (f.kind === "toast" && f.msg.startsWith("Badge — ")) awarded.add(f.msg.slice(8));
      count(fxLabel(f));
    }
    if (act.kind === "normalize") count("normalize into " + (baseRun.ret.includes('"same":true') ? "same object" : "new object"));
    if (act.kind === "next" && base.session?.phase === "done") count(base.session.right === base.session.ids.length ? "run perfect" : "run done");
    if (baseRun.sameData === true && act.kind !== "setTrack") count("no-op (same data)");
  }

  const missingBadges = BADGES.filter((b) => !awarded.has(b.n)).map((b) => b.id);
  const list = (pick) => Object.entries(tally).filter(([k]) => pick(k)).map(([k, n]) => `${k} ${n}`).join(", ");
  const removed = Object.keys(baseApi).filter((k) => !(k in newApi));
  console.log(`engine-diff: base ${REF} (${sha.slice(0, 7)}) against the working tree`);
  if (removed.length) console.log(`  exports the new tree no longer has: ${removed.join(", ")}`);
  console.log(`  actions: ${list((k) => !k.includes(" "))}`);
  console.log(`  seen: ${list((k) => k.includes(" "))}`);
  console.log(`  badges awarded: ${BADGES.length - missingBadges.length} of ${BADGES.length}${missingBadges.length ? ` (never: ${missingBadges.join(", ")})` : ""}`);
  console.log(`engine-diff: ${step} steps against ${REF}, ${mismatch ? "MISMATCH" : "0 mismatches"}`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
process.exit(mismatch ? 1 : 0);
