import { Q } from "../../data/questions";
import { PROB_INDEX, TRACKS, TRACK_IDS } from "../../data/tracks";
import type { Day, DeckId, NonEmpty, PersistedData, Track, TrackData, TrackId } from "../../types";

export const trackOf = (data: PersistedData): Track => TRACKS[data.track];

export const progressOf = (data: PersistedData, id: TrackId = data.track): TrackData =>
  data.tracks[id];

export const dayDone = (t: TrackData, day: Day): boolean =>
  day.probs.every((p) => !!t.done[p.id]);

// Plans are non-empty; the fallback only satisfies noUncheckedIndexedAccess.
const lastDay = (plan: NonEmpty<Day>): Day => plan[plan.length - 1] ?? plan[0];

export const focusDay = (data: PersistedData, id: TrackId = data.track): Day => {
  const plan = TRACKS[id].plan;
  const t = data.tracks[id];
  return plan.find((d) => !dayDone(t, d)) ?? lastDay(plan);
};

export const stationsCleared = (data: PersistedData, id: TrackId = data.track): number =>
  TRACKS[id].plan.filter((d) => dayDone(data.tracks[id], d)).length;

// Only ids the line still carries, so a stale export can't inflate it.
export const problemsDone = (data: PersistedData, id: TrackId = data.track): number =>
  Object.keys(data.tracks[id].done).filter((pid) => PROB_INDEX[pid]?.track === id).length;

export const ritualsLogged = (data: PersistedData, id: TrackId = data.track): number =>
  Object.keys(data.tracks[id].rituals).length;

export const hasAnyProgress = (data: PersistedData): boolean =>
  data.quiz.answered > 0 ||
  TRACK_IDS.some((id) => {
    const t = data.tracks[id];
    return t.xp > 0 || Object.keys(t.done).length > 0 || Object.keys(t.rituals).length > 0;
  });

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

export const acceptedTotal = (data: PersistedData): number =>
  TRACK_IDS.reduce(
    (n, id) => n + Object.keys(data.tracks[id].accepted).filter((pid) => PROB_INDEX[pid]).length,
    0
  );

export const accuracy = (data: PersistedData): number =>
  data.quiz.answered ? Math.round((data.quiz.correct / data.quiz.answered) * 100) : 0;

export interface DeckStat {
  n: number;
  pct: number | null;
}

export function deckStat(data: PersistedData, deck: DeckId): DeckStat {
  // Redemption's cards are the misses owed, so it has no hit rate.
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
