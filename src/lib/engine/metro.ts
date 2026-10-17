import { Q_BY_ID } from "../../data/questions";
import type { DeckId, EngineOpts, Fx, PersistedData, QStat, Question, Session, Track } from "../../types";
import { STOPS, buildDeck, shuffle } from "./deck";
import { addXP, award, confetti, ctxOf, type Mutation } from "./kernel";

export interface RunMutation extends Mutation {
  session: Session | null;
}

const PERFECT_XP = 20;

// Only a full-length run can be perfect; a short Redemption run can't earn the bonus.
const perfectRun = (right: number, n: number): boolean => right === n && n >= STOPS;

// Options are stored answer-first, so every card gets its own display order.
const dealOrder = (rng: () => number): number[] => shuffle([0, 1, 2, 3], rng);

export const stopsFor = (data: PersistedData, deck: DeckId): number =>
  deck === "redo" ? Math.min(data.quiz.missed.length, STOPS) : STOPS;

export const multiplier = (streak: number): number =>
  streak >= 6 ? 3 : streak >= 3 ? 2 : 1;

export function currentCard(session: Session): Question | null {
  const id = session.ids[session.i];
  if (id === undefined) return null;
  return Q_BY_ID[id] ?? null;
}

export function startSession(
  data: PersistedData,
  deckId: DeckId,
  opts: EngineOpts = {}
): { session: Session | null; fx: Fx[] } {
  const rng = opts.rng || Math.random;
  const ids = buildDeck(data, deckId, rng);
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

export function answerCard(
  data: PersistedData,
  session: Session | null,
  slot: number,
  opts?: EngineOpts
): RunMutation {
  if (!session || session.phase !== "ask") return { data, session, fx: [] };

  const q = currentCard(session);
  const orig = session.order[slot];
  // Reachable only from a session that outlived the data it was built from.
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
      if (st.bugRight >= 20) award(c, "bugs20");
    }
    st.missed = st.missed.filter((id) => id !== q.id);
    addXP(c, c.d.track, gain, "", true); // silent: the run's own counter is the feedback
  } else {
    s.streak = 0;
    if (st.missed.indexOf(q.id) === -1) st.missed.push(q.id);
  }

  if (st.answered >= 100) award(c, "metro100");

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
      award(c, "perfect");
      confetti(c, 70);
      addXP(c, c.d.track, PERFECT_XP, "perfect run");
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
