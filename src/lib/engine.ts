/* Every rule of the app, as pure functions.
 *
 * Mutating helpers take the persisted state and return `{ data, fx }` — a new
 * state plus an ordered list of celebrations (toasts, confetti bursts) for the
 * UI to play. Nothing here touches the DOM, the clock or localStorage unless
 * you hand it one, which is what makes the whole rulebook unit-testable.
 */

import { PLAN, PROBS, DAY_OF, RITUAL_XP, probXP } from "../data/plan";
import { RANKS, BADGES } from "../data/meta";
import { Q, Q_BY_ID } from "../data/questions";
import { todayStr, daysBetween } from "./dates";
import type {
  Day,
  DeckId,
  EngineOpts,
  Fx,
  PersistedData,
  QStat,
  QuizData,
  Question,
  Rank,
  Session,
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

export const blank = (): PersistedData => ({
  v: 1,
  xp: 0,
  done: {},
  rituals: {},
  quiz: {
    answered: 0,
    correct: 0,
    perQ: {},
    missed: [],
    bestStreak: 0,
    sessions: 0,
    perfect: 0,
    bugRight: 0,
  },
  badges: {},
  streak: { last: "", cur: 0, best: 0 },
});

/** Anything that came in off the wire: an object, but nothing more is known. */
type Loose = Record<string, unknown>;

const isObj = (x: unknown): x is Loose =>
  !!x && typeof x === "object" && !Array.isArray(x);

/* Matches the old Number.isFinite guard exactly: no coercion, so "5" is 0. */
const num = (x: unknown): number => (typeof x === "number" && Number.isFinite(x) ? x : 0);

/* Accepts anything an export from the reference app (or an older build) might
   hold, and fills in whatever is missing. Returns a fresh blank for a payload
   that isn't a v1 export at all.

   This is the app's only trust boundary, which is why it is the only place
   that takes `unknown`: everything downstream gets a real PersistedData.

   Spread-then-override throughout, never a fresh literal — a spread updates a
   duplicated key in place rather than moving it to the end, so the key order
   of the export survives and a re-export stays byte-identical. */
export function normalize(loaded: unknown): PersistedData {
  const base = blank();
  if (!isObj(loaded) || loaded["v"] !== 1) return base;

  const raw = { ...(base as unknown as Loose), ...loaded };

  const rawQuiz = isObj(raw["quiz"]) ? raw["quiz"] : {};
  const q = { ...(blank().quiz as unknown as Loose), ...rawQuiz };
  const quiz: QuizData = {
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

  return {
    ...(raw as unknown as PersistedData),
    v: 1,
    xp: typeof raw["xp"] === "number" && Number.isFinite(raw["xp"])
      ? Math.max(0, Math.round(raw["xp"]))
      : 0,
    done: isObj(raw["done"]) ? ({ ...raw["done"] } as Record<string, true>) : {},
    rituals: isObj(raw["rituals"]) ? ({ ...raw["rituals"] } as Record<string, string>) : {},
    quiz,
    badges: isObj(raw["badges"]) ? ({ ...raw["badges"] } as Record<string, number>) : {},
    streak: { ...blank().streak, ...(isObj(raw["streak"]) ? raw["streak"] : {}) },
  };
}

const clone = (d: PersistedData): PersistedData => ({
  ...d,
  done: { ...d.done },
  rituals: { ...d.rituals },
  badges: { ...d.badges },
  streak: { ...d.streak },
  quiz: {
    ...d.quiz,
    perQ: Object.fromEntries(Object.entries(d.quiz.perQ).map(([k, v]) => [k, { ...v }])),
    missed: [...d.quiz.missed],
  },
});

/* ------------------------------ derivations ------------------------------ */

export const dayDone = (data: PersistedData, day: Day): boolean =>
  day.probs.every((p) => !!data.done[p.id]);

/* PLAN is a non-empty tuple, so the terminus fallback resolves at compile time
   without an assertion or an impossible-state branch. */
const LAST_DAY: Day = PLAN[PLAN.length - 1] ?? PLAN[0];

export const focusDay = (data: PersistedData): Day =>
  PLAN.find((d) => !dayDone(data, d)) ?? LAST_DAY;

export const stationsCleared = (data: PersistedData): number =>
  PLAN.filter((d) => dayDone(data, d)).length;

/* Only counts ids the plan still knows about, so a stale export can't inflate it. */
export const problemsDone = (data: PersistedData): number =>
  Object.keys(data.done).filter((id) => PROBS[id]).length;

export const ritualsLogged = (data: PersistedData): number =>
  Object.keys(data.rituals).length;

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

/* Same story as LAST_DAY: RANKS is non-empty, so a computed index resolves. */
const rankAt = (i: number): Rank => RANKS[i] ?? RANKS[0];

export function rankIdx(xp: number): number {
  let i = 0;
  for (let k = 0; k < RANKS.length; k++) {
    const r = RANKS[k];
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

export function rankProgress(xp: number): RankProgress {
  const i = rankIdx(xp);
  const next = RANKS[i + 1];
  const lo = rankAt(i)[1];
  return {
    idx: i,
    name: rankAt(i)[0],
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

function _award(c: Ctx, id: string): void {
  if (c.d.badges[id]) return; // badges are never revoked, never re-announced
  c.d.badges[id] = c.now;
  const b = BADGES.find((x) => x.id === id);
  if (b) toast(c, "Badge — " + b.n, true);
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

function _addXP(c: Ctx, n: number, why?: string, quiet?: boolean): void {
  const before = rankIdx(c.d.xp);
  c.d.xp = Math.max(0, c.d.xp + n); // XP floors at 0
  const after = rankIdx(c.d.xp);
  if (n > 0) {
    _touchStreak(c);
    if (!quiet) toast(c, "+" + n + " XP" + (why ? " · " + why : ""));
  }
  if (after > before) {
    toast(c, "Rank up — " + rankAt(after)[0], true);
    confetti(c, 60);
    if (after === RANKS.length - 1) _award(c, "noogler");
  }
}

const out = (c: Ctx): Mutation => ({ data: c.d, fx: c.fx });

/* -------------------------------- the line -------------------------------- */

export function toggleProb(data: PersistedData, id: string, opts?: EngineOpts): Mutation {
  const p = PROBS[id];
  const day = DAY_OF[id];
  /* Both indexes are built in one pass, so this is really one check: an id the
     plan no longer contains, arriving from a stale export. */
  if (!p || !day) return { data, fx: [] };
  const c = ctxOf(data, opts);

  if (c.d.done[id]) {
    delete c.d.done[id];
    _addXP(c, -probXP(p), "", true); // unchecking refunds silently
    return out(c);
  }

  c.d.done[id] = true;
  _addXP(c, probXP(p), p.n.length > 26 ? p.n.slice(0, 24) + "…" : p.n);
  _award(c, "first");

  if (dayDone(c.d, day)) {
    toast(c, day.stn + " cleared", true);
    confetti(c, 50);
    const cleared = stationsCleared(c.d);
    if (cleared >= Math.ceil(PLAN.length / 2)) _award(c, "half");
    if (cleared === PLAN.length) {
      _award(c, "line");
      confetti(c, 90);
    }
  } else {
    confetti(c, 12);
  }
  return out(c);
}

export function toggleRitual(
  data: PersistedData,
  dayId: string,
  opts?: EngineOpts
): Mutation {
  const c = ctxOf(data, opts);
  if (c.d.rituals[dayId]) {
    delete c.d.rituals[dayId];
    _addXP(c, -RITUAL_XP, "", true);
  } else {
    c.d.rituals[dayId] = c.today;
    _addXP(c, RITUAL_XP, "ritual");
    if (Object.keys(c.d.rituals).length >= 5) _award(c, "ritual5");
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
    _addXP(c, gain, "", true); // silent: the run's own counter is the feedback
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
    if (s.right === s.ids.length && s.ids.length >= STOPS) {
      c.d.quiz.perfect++;
      _award(c, "perfect");
      _addXP(c, 20, "perfect run");
      confetti(c, 70);
    }
  } else {
    s.i++;
    s.phase = "ask";
    s.order = dealOrder(c.rng);
    s.picked = null;
  }
  return { data: c.d, session: s, fx: c.fx };
}

export function runResultCopy(right: number, n: number): string {
  if (right === n) return "Perfect run. The doors open at Google.";
  if (right >= n * 0.7) return "Solid. The missed ones went to Redemption.";
  return "Rough stop — Redemption deck is waiting.";
}

export function terminusCopy(cleared: number): string {
  return cleared === PLAN.length
    ? "All " + PLAN.length + " stations cleared. Walk in like you own the whiteboard."
    : cleared + " of " + PLAN.length +
      " stations behind you. The terminus isn't going anywhere — you are.";
}
