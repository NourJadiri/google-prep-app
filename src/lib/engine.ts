/* Every rule of the app, as pure functions.
 *
 * Mutating helpers take the persisted state and return `{ data, fx }` — a new
 * state plus an ordered list of celebrations (toasts, confetti bursts) for the
 * UI to play. Nothing here touches the DOM, the clock or localStorage unless
 * you hand it one, which is what makes the whole rulebook unit-testable.
 */

import { RITUAL_XP, probXP } from "../data/plan";
import { BADGES } from "../data/meta";
import { Q, Q_BY_ID } from "../data/questions";
import { DAY_INDEX, PROB_INDEX, TRACKS, TRACK_IDS, isTrackId, type ProblemRef } from "../data/tracks";
import { todayStr, daysBetween } from "./dates";
import type {
  Day,
  DeckId,
  EngineOpts,
  Fx,
  NonEmpty,
  PersistedData,
  QStat,
  QuizData,
  Question,
  Rank,
  Session,
  Track,
  TrackData,
  TrackId,
} from "../types";

export const STOPS = 10;
export const MOCK_SECONDS = 25 * 60;

/** What a mutating rule hands back: the next state, and what to celebrate. */
export interface Mutation {
  data: PersistedData;
  fx: Fx[];
}

/** Same, for the rules that also advance a run. */
export interface RunMutation extends Mutation {
  session: Session | null;
}

/* ------------------------------ state shape ------------------------------ */

export const blankTrack = (): TrackData => ({ xp: 0, done: {}, rituals: {}, accepted: {} });

const blankQuiz = (): QuizData => ({
  answered: 0,
  correct: 0,
  perQ: {},
  missed: [],
  bestStreak: 0,
  sessions: 0,
  perfect: 0,
  bugRight: 0,
});

const eachTrack = <T>(f: (id: TrackId) => T): Record<TrackId, T> =>
  Object.fromEntries(TRACK_IDS.map((id) => [id, f(id)])) as Record<TrackId, T>;

export const blank = (): PersistedData => ({
  v: 2,
  track: "google",
  tracks: eachTrack(blankTrack),
  quiz: blankQuiz(),
  badges: {},
  streak: { last: "", cur: 0, best: 0 },
});

/** Anything that came in off the wire: an object, but nothing more is known. */
type Loose = Record<string, unknown>;

const isObj = (x: unknown): x is Loose =>
  !!x && typeof x === "object" && !Array.isArray(x);

/* Matches the old Number.isFinite guard exactly: no coercion, so "5" is 0. */
const num = (x: unknown): number => (typeof x === "number" && Number.isFinite(x) ? x : 0);

const xpOf = (x: unknown): number =>
  typeof x === "number" && Number.isFinite(x) ? Math.max(0, Math.round(x)) : 0;

function normQuiz(x: unknown): QuizData {
  const q = { ...(blankQuiz() as unknown as Loose), ...(isObj(x) ? x : {}) };
  return {
    ...(q as unknown as QuizData),
    answered: num(q["answered"]),
    correct: num(q["correct"]),
    perQ: isObj(q["perQ"]) ? ({ ...q["perQ"] } as Record<string, QStat>) : {},
    missed: Array.isArray(q["missed"])
      ? q["missed"].filter((id): id is string => typeof id === "string" && !!Q_BY_ID[id])
      : [],
    bestStreak: num(q["bestStreak"]),
    sessions: num(q["sessions"]),
    perfect: num(q["perfect"]),
    bugRight: num(q["bugRight"]),
  };
}

function normTrack(x: unknown): TrackData {
  const { peak, uncleared, ...t } = isObj(x) ? x : {};
  const accepted = isObj(t["accepted"]) ? t["accepted"] : {};
  return {
    ...(t as unknown as TrackData),
    ...(typeof peak === "number" && Number.isFinite(peak) ? { peak } : {}),
    ...(isObj(uncleared) ? { uncleared: { ...uncleared } as Record<string, true> } : {}),
    xp: xpOf(t["xp"]),
    done: isObj(t["done"]) ? ({ ...t["done"] } as Record<string, true>) : {},
    rituals: isObj(t["rituals"]) ? ({ ...t["rituals"] } as Record<string, string>) : {},
    accepted: Object.fromEntries(
      Object.entries(accepted).filter(([, v]) => typeof v === "number" && Number.isFinite(v))
    ) as Record<string, number>,
  };
}

const normBadges = (x: unknown): Record<string, number> =>
  isObj(x) ? ({ ...x } as Record<string, number>) : {};

const normStreak = (x: unknown) => ({
  ...blank().streak,
  ...(isObj(x) ? x : {}),
});

/* Accepts every export the app has ever written — the reference app's v1
   blobs included — and fills in whatever is missing. Returns a fresh blank
   for a payload that is neither.

   This is the app's only trust boundary, which is why it is the only place
   that takes `unknown`: everything downstream gets a real PersistedData.

   A v1 blob is upgraded on the way in: its top-level xp/done/rituals were
   the Google line's, all of it, so they become tracks.google and the Local
   starts empty. A v2 blob keeps any key this build doesn't know (a newer
   build's), spread-then-override as before, so a round trip loses nothing. */
export function normalize(loaded: unknown): PersistedData {
  if (!isObj(loaded)) return blank();

  if (loaded["v"] === 1) {
    return {
      v: 2,
      track: "google",
      tracks: {
        ...eachTrack(blankTrack),
        google: normTrack({ xp: loaded["xp"], done: loaded["done"], rituals: loaded["rituals"] }),
      },
      quiz: normQuiz(loaded["quiz"]),
      badges: normBadges(loaded["badges"]),
      streak: normStreak(loaded["streak"]),
    };
  }

  if (loaded["v"] !== 2) return blank();

  const raw = { ...(blank() as unknown as Loose), ...loaded };
  const tracks = isObj(raw["tracks"]) ? raw["tracks"] : {};
  return {
    ...(raw as unknown as PersistedData),
    v: 2,
    track: isTrackId(raw["track"]) ? raw["track"] : "google",
    tracks: eachTrack((id) => normTrack(tracks[id])),
    quiz: normQuiz(raw["quiz"]),
    badges: normBadges(raw["badges"]),
    streak: normStreak(raw["streak"]),
  };
}

/** Is this a blob some build of the app wrote — one normalize can read? */
export const isExport = (x: unknown): boolean =>
  isObj(x) && (x["v"] === 1 || x["v"] === 2);

const cloneTrack = (t: TrackData): TrackData => ({
  ...t,
  done: { ...t.done },
  rituals: { ...t.rituals },
  accepted: { ...t.accepted },
  ...(t.uncleared ? { uncleared: { ...t.uncleared } } : {}),
});

const clone = (d: PersistedData): PersistedData => ({
  ...d,
  tracks: eachTrack((id) => cloneTrack(d.tracks[id])),
  badges: { ...d.badges },
  streak: { ...d.streak },
  quiz: {
    ...d.quiz,
    perQ: Object.fromEntries(Object.entries(d.quiz.perQ).map(([k, v]) => [k, { ...v }])),
    missed: [...d.quiz.missed],
  },
});

/** Switch lines. Not an Fx-bearing rule: nothing to celebrate, just a view. */
export const setTrack = (data: PersistedData, track: TrackId): PersistedData =>
  data.track === track ? data : { ...data, track };

/* ------------------------------ derivations ------------------------------ */

/* Every derivation below reads one line — the one showing, unless told. */

export const trackOf = (data: PersistedData): Track => TRACKS[data.track];

export const progressOf = (data: PersistedData, id: TrackId = data.track): TrackData =>
  data.tracks[id];

export const dayDone = (t: TrackData, day: Day): boolean =>
  day.probs.every((p) => !!t.done[p.id]);

/* A plan is a non-empty tuple, so the terminus fallback resolves at compile
   time without an assertion or an impossible-state branch. */
const lastDay = (plan: NonEmpty<Day>): Day => plan[plan.length - 1] ?? plan[0];

export const focusDay = (data: PersistedData, id: TrackId = data.track): Day => {
  const plan = TRACKS[id].plan;
  const t = data.tracks[id];
  return plan.find((d) => !dayDone(t, d)) ?? lastDay(plan);
};

export const stationsCleared = (data: PersistedData, id: TrackId = data.track): number =>
  TRACKS[id].plan.filter((d) => dayDone(data.tracks[id], d)).length;

/* Only counts ids the line still carries, so a stale export can't inflate it. */
export const problemsDone = (data: PersistedData, id: TrackId = data.track): number =>
  Object.keys(data.tracks[id].done).filter((pid) => PROB_INDEX[pid]?.track === id).length;

export const ritualsLogged = (data: PersistedData, id: TrackId = data.track): number =>
  Object.keys(data.tracks[id].rituals).length;

/** Anything on any line worth not overwriting: XP, ticks, rituals, cards. */
export const hasAnyProgress = (data: PersistedData): boolean =>
  data.quiz.answered > 0 ||
  TRACK_IDS.some((id) => {
    const t = data.tracks[id];
    return t.xp > 0 || Object.keys(t.done).length > 0 || Object.keys(t.rituals).length > 0;
  });

/** This device's progress in one phrase, for the linking consent card:
 *  "1240 XP · 41 problems on Onsite Express, 50 XP · 5 on Day One Local". */
export function progressSummary(data: PersistedData): string {
  const lines = TRACK_IDS.filter((id) => data.tracks[id].xp > 0 || problemsDone(data, id) > 0);
  if (!lines.length) return "no XP, no problems";
  return lines
    .map((id, k) => {
      const n = problemsDone(data, id);
      return `${data.tracks[id].xp} XP · ${n}${k === 0 ? (n === 1 ? " problem" : " problems") : ""} on ${TRACKS[id].name}`;
    })
    .join(", ");
}

/** Problems passed in the workspace, both lines together. */
export const acceptedTotal = (data: PersistedData): number =>
  TRACK_IDS.reduce(
    (n, id) => n + Object.keys(data.tracks[id].accepted).filter((pid) => PROB_INDEX[pid]).length,
    0
  );

export const accuracy = (data: PersistedData): number =>
  data.quiz.answered ? Math.round((data.quiz.correct / data.quiz.answered) * 100) : 0;

/** What the departures board prints per deck: how many cards the line carries,
 *  and your hit rate across them — null until a card of it has been seen.
 *  Redemption's "cards" are the misses currently owed, so its pct stays null. */
export interface DeckStat {
  n: number;
  pct: number | null;
}

export function deckStat(data: PersistedData, deck: DeckId): DeckStat {
  if (deck === "redo") return { n: data.quiz.missed.length, pct: null };
  const pool = deck === "mix" ? Q : Q.filter((q) => q.ph === deck);
  let seen = 0;
  let right = 0;
  pool.forEach((q) => {
    const s = data.quiz.perQ[q.id];
    if (s) {
      seen += s.seen;
      right += s.right;
    }
  });
  return { n: pool.length, pct: seen ? Math.round((right / seen) * 100) : null };
}

/* Same story as lastDay: a ladder is non-empty, so a computed index resolves. */
const rankAt = (ranks: NonEmpty<Rank>, i: number): Rank => ranks[i] ?? ranks[0];

export function rankIdx(ranks: NonEmpty<Rank>, xp: number): number {
  let i = 0;
  for (let k = 0; k < ranks.length; k++) {
    const r = ranks[k];
    if (r && xp >= r[1]) i = k;
  }
  return i;
}

export interface RankProgress {
  idx: number;
  name: string;
  /** Percent of the way to the next rank; 100 at the terminus rank. */
  pct: number;
  nextLabel: string;
}

export function rankProgress(ranks: NonEmpty<Rank>, xp: number): RankProgress {
  const i = rankIdx(ranks, xp);
  const next = ranks[i + 1];
  const lo = rankAt(ranks, i)[1];
  return {
    idx: i,
    name: rankAt(ranks, i)[0],
    pct: next ? Math.min(100, Math.round(((xp - lo) / (next[1] - lo)) * 100)) : 100,
    nextLabel: next ? next[1] - xp + " XP to " + next[0] : "Terminus rank reached",
  };
}

export const fmtT = (s: number): string =>
  String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");

/* ---------------------------- effects plumbing ---------------------------- */

interface Ctx {
  d: PersistedData;
  fx: Fx[];
  today: string;
  now: number;
  rng: () => number;
}

function ctxOf(data: PersistedData, opts: EngineOpts = {}): Ctx {
  return {
    d: clone(data),
    fx: [],
    today: opts.today || todayStr(),
    now: opts.now === undefined ? Date.now() : opts.now,
    rng: opts.rng || Math.random,
  };
}

const toast = (c: Ctx, msg: string, gold = false): void => {
  c.fx.push({ kind: "toast", msg, gold });
};

const confetti = (c: Ctx, n: number): void => {
  c.fx.push({ kind: "confetti", n });
};

function _award(c: Ctx, id: string): boolean {
  if (c.d.badges[id]) return false; // badges are never revoked, never re-announced
  c.d.badges[id] = c.now;
  const b = BADGES.find((x) => x.id === id);
  if (b) toast(c, "Badge — " + b.n, true);
  return true;
}

/* A streak is consecutive calendar days on which anything earned XP. */
function _touchStreak(c: Ctx): void {
  const st = c.d.streak;
  if (st.last === c.today) return;
  st.cur = st.last && daysBetween(st.last, c.today) === 1 ? st.cur + 1 : 1;
  st.last = c.today;
  if (st.cur > st.best) st.best = st.cur;
  if (st.cur >= 3) _award(c, "streak3");
  if (st.cur >= 7) _award(c, "streak7");
}

/* XP lands on one line and climbs that line's ladder; the streak it touches
   is shared, because studying is studying whichever train you're on.
   A refund that drops a rank leaves `peak` behind, so earning the rank back
   is not announced a second time. */
function _addXP(c: Ctx, track: TrackId, n: number, why?: string, quiet?: boolean): void {
  const T = TRACKS[track];
  const t = c.d.tracks[track];
  const was = t.xp;
  const best = rankIdx(T.ranks, Math.max(was, t.peak ?? 0));
  t.xp = Math.max(0, was + n); // XP floors at 0
  const after = rankIdx(T.ranks, t.xp);
  if (after < rankIdx(T.ranks, was)) t.peak = Math.max(t.peak ?? 0, was);
  else if (t.peak !== undefined && t.xp >= t.peak) delete t.peak;
  if (n <= 0) return;

  if (!quiet) toast(c, "+" + n + " XP" + (why ? " · " + why : ""));
  if (after > best) {
    toast(c, "Rank up — " + rankAt(T.ranks, after)[0], true);
    confetti(c, 60);
    if (after === T.ranks.length - 1) _award(c, T.award.top);
  }
  _touchStreak(c);
}

const out = (c: Ctx): Mutation => ({ data: c.d, fx: c.fx });

/* -------------------------------- the line -------------------------------- */

/* Ticking a problem: XP on its own line, the line's first-problem badge, and
   a station clear if this was the station's last one — unless an untick had
   taken that clear back, in which case it is just a tick. */
function _check(c: Ctx, ref: ProblemRef): void {
  const { prob: p, day, track } = ref;
  const T = TRACKS[track];
  const t = c.d.tracks[track];
  t.done[p.id] = true;
  _addXP(c, track, probXP(p), p.n.length > 26 ? p.n.slice(0, 24) + "…" : p.n);
  _award(c, T.award.first);

  if (!dayDone(t, day)) {
    confetti(c, 12);
    return;
  }
  if (t.uncleared?.[day.id]) {
    forgetUnclear(t, day.id);
    confetti(c, 12);
    return;
  }
  toast(c, day.stn + " cleared", true);
  confetti(c, 50);
  const cleared = T.plan.filter((d) => dayDone(t, d)).length;
  if (cleared >= Math.ceil(T.plan.length / 2)) _award(c, T.award.half);
  if (cleared === T.plan.length && _award(c, T.award.line)) confetti(c, 90);
}

function forgetUnclear(t: TrackData, dayId: string): void {
  if (!t.uncleared) return;
  delete t.uncleared[dayId];
  if (!Object.keys(t.uncleared).length) delete t.uncleared;
}

export function toggleProb(data: PersistedData, id: string, opts?: EngineOpts): Mutation {
  /* An id no line carries any more, arriving from a stale export. */
  const ref = PROB_INDEX[id];
  if (!ref) return { data, fx: [] };
  const c = ctxOf(data, opts);
  const t = c.d.tracks[ref.track];

  if (t.done[id]) {
    if (dayDone(t, ref.day)) t.uncleared = { ...t.uncleared, [ref.day.id]: true };
    delete t.done[id];
    _addXP(c, ref.track, -probXP(ref.prob), "", true); // unchecking refunds silently
    return out(c);
  }
  _check(c, ref);
  return out(c);
}

/** Every test passed in the workspace. Ticks the problem if it wasn't (with
 *  everything a tick earns), and remembers the pass for the editor badges —
 *  once: passing again changes nothing, so it writes nothing. */
export function acceptProb(data: PersistedData, id: string, opts?: EngineOpts): Mutation {
  const ref = PROB_INDEX[id];
  if (!ref) return { data, fx: [] };
  const was = data.tracks[ref.track];
  const first = !was.accepted[id];
  if (!first && was.done[id]) return { data, fx: [] };

  const c = ctxOf(data, opts);
  const t = c.d.tracks[ref.track];
  if (first) t.accepted[id] = c.now;
  if (!t.done[id]) _check(c, ref);
  if (first) {
    _award(c, "green");
    if (acceptedTotal(c.d) >= 25) _award(c, "green25");
  }
  return out(c);
}

export function toggleRitual(
  data: PersistedData,
  dayId: string,
  opts?: EngineOpts
): Mutation {
  const ref = DAY_INDEX[dayId];
  if (!ref) return { data, fx: [] };
  const c = ctxOf(data, opts);
  const t = c.d.tracks[ref.track];
  if (t.rituals[dayId]) {
    delete t.rituals[dayId];
    _addXP(c, ref.track, -RITUAL_XP, "", true);
  } else {
    t.rituals[dayId] = c.today;
    _addXP(c, ref.track, RITUAL_XP, "ritual");
    if (Object.keys(t.rituals).length >= 5) _award(c, "ritual5");
  }
  return out(c);
}

/* ------------------------------- metro mode ------------------------------- */

export function shuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    // i and j are both in [0, a.length) by construction.
    const t = a[i]!;
    a[i] = a[j]!;
    a[j] = t;
  }
  return a;
}

/* Weakest cards first: a low hit-rate scores low, and the random term keeps a
   run from being the same ten cards every time. */
export function pickWeighted(
  pool: readonly Question[],
  n: number,
  perQ: Record<string, QStat>,
  rng: () => number = Math.random
): string[] {
  const scored: Array<[number, string]> = pool.map((q) => {
    const s = perQ[q.id] ?? { seen: 0, right: 0 };
    return [(s.right + 1) / (s.seen + 2) + rng() * 0.55, q.id];
  });
  scored.sort((a, b) => a[0] - b[0]);
  return scored.slice(0, n).map((x) => x[1]);
}

export function buildSession(
  data: PersistedData,
  deckId: DeckId,
  rng: () => number = Math.random
): string[] {
  const N = STOPS;
  const perQ = data.quiz.perQ;

  if (deckId === "redo") return shuffle(data.quiz.missed, rng).slice(0, N);

  if (deckId === "mix") {
    const ph = focusDay(data).ph;
    const missed = shuffle(data.quiz.missed, rng).slice(0, 3);
    const rest = Q.filter((q) => missed.indexOf(q.id) === -1);
    const focus = ph === "mix" ? [] : rest.filter((q) => q.ph === ph);
    const others = ph === "mix" ? rest : rest.filter((q) => q.ph !== ph);
    const wantF = Math.min(focus.length, Math.ceil((N - missed.length) / 2));
    const idsF = pickWeighted(focus, wantF, perQ, rng);
    const idsO = pickWeighted(others, N - missed.length - wantF, perQ, rng);
    return shuffle(missed.concat(idsF, idsO), rng);
  }

  return shuffle(pickWeighted(Q.filter((q) => q.ph === deckId), N, perQ, rng), rng);
}

/** The card a run is currently on, or null if the run has run off its ids. */
export function currentCard(session: Session): Question | null {
  const id = session.ids[session.i];
  if (id === undefined) return null;
  return Q_BY_ID[id] ?? null;
}

/* Options are stored with the answer at index 0; a run never shows them in
   stored order, so every card carries its own display permutation. */
const dealOrder = (rng: () => number): number[] => shuffle([0, 1, 2, 3], rng);

export function startSession(
  data: PersistedData,
  deckId: DeckId,
  opts: EngineOpts = {}
): { session: Session | null; fx: Fx[] } {
  const rng = opts.rng || Math.random;
  const ids = buildSession(data, deckId, rng);
  if (!ids.length) {
    return {
      session: null,
      fx: [{ kind: "toast", msg: "That deck is empty right now", gold: false }],
    };
  }
  return {
    session: {
      deck: deckId,
      ids,
      i: 0,
      streak: 0,
      best: 0,
      right: 0,
      xp: 0,
      phase: "ask",
      results: [],
      order: dealOrder(rng),
      picked: null,
    },
    fx: [],
  };
}

const PERFECT_XP = 20;

/* Only a full-length run can be perfect; a short Redemption run can't earn the bonus. */
const perfectRun = (right: number, n: number): boolean => right === n && n >= STOPS;

/** How many stops a run on this deck will have: Redemption deals only what is owed. */
export const stopsFor = (data: PersistedData, deck: DeckId): number =>
  deck === "redo" ? Math.min(data.quiz.missed.length, STOPS) : STOPS;

export const multiplier = (streak: number): number =>
  streak >= 6 ? 3 : streak >= 3 ? 2 : 1;

export function answerCard(
  data: PersistedData,
  session: Session | null,
  slot: number,
  opts?: EngineOpts
): RunMutation {
  if (!session || session.phase !== "ask") return { data, session, fx: [] };

  const q = currentCard(session);
  const orig = session.order[slot];
  /* A card the bank no longer has, or a slot outside the deal — only reachable
     from a session that outlived the data it was built from. */
  if (!q || orig === undefined) return { data, session, fx: [] };

  const c = ctxOf(data, opts);
  const s: Session = { ...session, results: [...session.results] };
  const ok = orig === q.a;
  const st = c.d.quiz;

  st.answered++;
  const pq: QStat = st.perQ[q.id] ?? { seen: 0, right: 0 };
  st.perQ[q.id] = pq;
  pq.seen++;

  if (ok) {
    pq.right++;
    st.correct++;
    s.streak++;
    if (s.streak > s.best) s.best = s.streak;
    if (s.streak > st.bestStreak) st.bestStreak = s.streak;

    const gain = 2 * multiplier(s.streak);
    s.xp += gain;
    s.right++;

    if (q.t === "bug") {
      st.bugRight = (st.bugRight || 0) + 1;
      if (st.bugRight >= 20) _award(c, "bugs20");
    }
    st.missed = st.missed.filter((id) => id !== q.id); // redemption served
    _addXP(c, c.d.track, gain, "", true); // silent: the run's own counter is the feedback
  } else {
    s.streak = 0;
    if (st.missed.indexOf(q.id) === -1) st.missed.push(q.id);
  }

  if (st.answered >= 100) _award(c, "metro100");

  s.results.push(ok);
  s.phase = "reveal";
  s.picked = slot;
  return { data: c.d, session: s, fx: c.fx };
}

export function nextCard(
  data: PersistedData,
  session: Session | null,
  opts: EngineOpts = {}
): RunMutation {
  if (!session) return { data, session, fx: [] };
  const c = ctxOf(data, opts);
  const s: Session = { ...session, results: [...session.results] };

  if (s.i + 1 >= s.ids.length) {
    s.phase = "done";
    c.d.quiz.sessions++;
    if (perfectRun(s.right, s.ids.length)) {
      c.d.quiz.perfect++;
      _award(c, "perfect");
      confetti(c, 70);
      _addXP(c, c.d.track, PERFECT_XP, "perfect run");
      s.xp += PERFECT_XP;
    }
  } else {
    s.i++;
    s.phase = "ask";
    s.order = dealOrder(c.rng);
    s.picked = null;
  }
  return { data: c.d, session: s, fx: c.fx };
}

export function runResultCopy(track: Track, right: number, n: number): string {
  if (perfectRun(right, n)) return track.perfectCopy;
  if (right === n) return "All won back. The Redemption deck is clear.";
  if (right >= Math.round(n * 0.7)) return "Solid. The missed ones went to Redemption.";
  return "Rough stop — Redemption deck is waiting.";
}
