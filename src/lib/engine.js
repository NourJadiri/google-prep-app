/* Every rule of the app, as pure functions.
 *
 * Mutating helpers take the persisted state and return `{ data, fx }` — a new
 * state plus an ordered list of celebrations (toasts, confetti bursts) for the
 * UI to play. Nothing here touches the DOM, the clock or localStorage unless
 * you hand it one, which is what makes the whole rulebook unit-testable.
 */

import { PLAN, PROBS, DAY_OF, RITUAL_XP, probXP } from "../data/plan.js";
import { RANKS, BADGES } from "../data/meta.js";
import { Q, Q_BY_ID } from "../data/questions.js";
import { todayStr, daysBetween } from "./dates.js";

export const STOPS = 10;
export const MOCK_SECONDS = 25 * 60;

/* ------------------------------ state shape ------------------------------ */

export const blank = () => ({
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

const isObj = (x) => !!x && typeof x === "object" && !Array.isArray(x);

/* Accepts anything an export from the reference app (or an older build) might
   hold, and fills in whatever is missing. Returns a fresh blank for a payload
   that isn't a v1 export at all. */
export function normalize(loaded) {
  const base = blank();
  if (!isObj(loaded) || loaded.v !== 1) return base;

  const s = Object.assign(base, loaded);
  s.v = 1;
  s.xp = Number.isFinite(s.xp) ? Math.max(0, Math.round(s.xp)) : 0;
  s.done = isObj(s.done) ? { ...s.done } : {};
  s.rituals = isObj(s.rituals) ? { ...s.rituals } : {};
  s.badges = isObj(s.badges) ? { ...s.badges } : {};

  const q = Object.assign(blank().quiz, isObj(s.quiz) ? s.quiz : {});
  q.perQ = isObj(q.perQ) ? { ...q.perQ } : {};
  q.missed = Array.isArray(q.missed) ? q.missed.filter((id) => !!Q_BY_ID[id]) : [];
  for (const k of ["answered", "correct", "bestStreak", "sessions", "perfect", "bugRight"]) {
    q[k] = Number.isFinite(q[k]) ? q[k] : 0;
  }
  s.quiz = q;

  s.streak = Object.assign(blank().streak, isObj(s.streak) ? s.streak : {});
  return s;
}

const clone = (d) => ({
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

export const dayDone = (data, day) => day.probs.every((p) => !!data.done[p.id]);

export const focusDay = (data) =>
  PLAN.find((d) => !dayDone(data, d)) || PLAN[PLAN.length - 1];

export const stationsCleared = (data) => PLAN.filter((d) => dayDone(data, d)).length;

/* Only counts ids the plan still knows about, so a stale export can't inflate it. */
export const problemsDone = (data) => Object.keys(data.done).filter((id) => PROBS[id]).length;

export const ritualsLogged = (data) => Object.keys(data.rituals).length;

export const accuracy = (data) =>
  data.quiz.answered ? Math.round((data.quiz.correct / data.quiz.answered) * 100) : 0;

export function rankIdx(xp) {
  let i = 0;
  for (let k = 0; k < RANKS.length; k++) if (xp >= RANKS[k][1]) i = k;
  return i;
}

export function rankProgress(xp) {
  const i = rankIdx(xp);
  const next = RANKS[i + 1];
  const lo = RANKS[i][1];
  return {
    idx: i,
    name: RANKS[i][0],
    pct: next ? Math.min(100, Math.round(((xp - lo) / (next[1] - lo)) * 100)) : 100,
    nextLabel: next ? next[1] - xp + " XP to " + next[0] : "Terminus rank reached",
  };
}

export const fmtT = (s) =>
  String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");

/* ---------------------------- effects plumbing ---------------------------- */

function ctxOf(data, opts = {}) {
  return {
    d: clone(data),
    fx: [],
    today: opts.today || todayStr(),
    now: opts.now === undefined ? Date.now() : opts.now,
    rng: opts.rng || Math.random,
  };
}

const toast = (c, msg, gold = false) => c.fx.push({ kind: "toast", msg, gold });
const confetti = (c, n) => c.fx.push({ kind: "confetti", n });

function _award(c, id) {
  if (c.d.badges[id]) return; // badges are never revoked, never re-announced
  c.d.badges[id] = c.now;
  const b = BADGES.find((x) => x.id === id);
  if (b) toast(c, b.ic + " Badge — " + b.n, true);
}

/* A streak is consecutive calendar days on which anything earned XP. */
function _touchStreak(c) {
  const st = c.d.streak;
  if (st.last === c.today) return;
  st.cur = st.last && daysBetween(st.last, c.today) === 1 ? st.cur + 1 : 1;
  st.last = c.today;
  if (st.cur > st.best) st.best = st.cur;
  if (st.cur >= 3) _award(c, "streak3");
  if (st.cur >= 7) _award(c, "streak7");
}

function _addXP(c, n, why, quiet) {
  const before = rankIdx(c.d.xp);
  c.d.xp = Math.max(0, c.d.xp + n); // XP floors at 0
  const after = rankIdx(c.d.xp);
  if (n > 0) {
    _touchStreak(c);
    if (!quiet) toast(c, "+" + n + " XP" + (why ? " · " + why : ""));
  }
  if (after > before) {
    toast(c, "Rank up — " + RANKS[after][0], true);
    confetti(c, 60);
    if (after === RANKS.length - 1) _award(c, "noogler");
  }
}

const out = (c) => ({ data: c.d, fx: c.fx });

/* -------------------------------- the line -------------------------------- */

export function toggleProb(data, id, opts) {
  const p = PROBS[id];
  if (!p) return { data, fx: [] };
  const c = ctxOf(data, opts);

  if (c.d.done[id]) {
    delete c.d.done[id];
    _addXP(c, -probXP(p), "", true); // unchecking refunds silently
    return out(c);
  }

  c.d.done[id] = true;
  _addXP(c, probXP(p), p.n.length > 26 ? p.n.slice(0, 24) + "…" : p.n);
  _award(c, "first");

  const day = DAY_OF[id];
  if (dayDone(c.d, day)) {
    toast(c, "🚉 " + day.stn + " cleared", true);
    confetti(c, 50);
    const cleared = stationsCleared(c.d);
    if (cleared >= 4) _award(c, "half");
    if (cleared === 7) {
      _award(c, "line");
      confetti(c, 90);
    }
  } else {
    confetti(c, 12);
  }
  return out(c);
}

export function toggleRitual(data, dayId, opts) {
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

export function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

/* Weakest cards first: a low hit-rate scores low, and the random term keeps a
   run from being the same ten cards every time. */
export function pickWeighted(pool, n, perQ, rng = Math.random) {
  const scored = pool.map((q) => {
    const s = perQ[q.id] || { seen: 0, right: 0 };
    return [(s.right + 1) / (s.seen + 2) + rng() * 0.55, q.id];
  });
  scored.sort((a, b) => a[0] - b[0]);
  return scored.slice(0, n).map((x) => x[1]);
}

export function buildSession(data, deckId, rng = Math.random) {
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

/* Options are stored with the answer at index 0; a run never shows them in
   stored order, so every card carries its own display permutation. */
const dealOrder = (rng) => shuffle([0, 1, 2, 3], rng);

export function startSession(data, deckId, opts = {}) {
  const rng = opts.rng || Math.random;
  const ids = buildSession(data, deckId, rng);
  if (!ids.length) {
    return { session: null, fx: [{ kind: "toast", msg: "That deck is empty right now" }] };
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

export const multiplier = (streak) => (streak >= 6 ? 3 : streak >= 3 ? 2 : 1);

export function answerCard(data, session, slot, opts) {
  if (!session || session.phase !== "ask") return { data, session, fx: [] };

  const c = ctxOf(data, opts);
  const s = { ...session, results: [...session.results] };
  const q = Q_BY_ID[s.ids[s.i]];
  const ok = s.order[slot] === q.a;
  const st = c.d.quiz;

  st.answered++;
  const pq = (st.perQ[q.id] = st.perQ[q.id] || { seen: 0, right: 0 });
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

export function nextCard(data, session, opts = {}) {
  if (!session) return { data, session, fx: [] };
  const c = ctxOf(data, opts);
  const s = { ...session, results: [...session.results] };

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

export function runResultCopy(right, n) {
  if (right === n) return "Perfect run. The doors open at Google.";
  if (right >= n * 0.7) return "Solid. The missed ones went to Redemption.";
  return "Rough stop — Redemption deck is waiting.";
}

export function terminusCopy(cleared) {
  return cleared === 7
    ? "All seven stations cleared. Walk in like you own the whiteboard."
    : cleared + " of 7 stations behind you. The terminus isn't going anywhere — you are.";
}
