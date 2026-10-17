import { Q_BY_ID } from "../../data/questions";
import { TRACK_IDS, isTrackId } from "../../data/tracks";
import type { PersistedData, QStat, QuizData, TrackData, TrackId } from "../../types";

type Loose = Record<string, unknown>;

const isObj = (x: unknown): x is Loose =>
  !!x && typeof x === "object" && !Array.isArray(x);

const blankTrack = (): TrackData => ({ xp: 0, done: {}, rituals: {}, accepted: {} });

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

// No coercion: "5" is 0.
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

// The only place that takes unknown: it reads every export any build has written.
export function normalize(loaded: unknown): PersistedData {
  if (!isObj(loaded)) return blank();

  if (loaded["v"] === 1) {
    // v1 predates lines: its top-level xp, done and rituals were the Google line's.
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

  // Keys this build doesn't know (a newer build's) survive, so a round trip loses nothing.
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

export const isExport = (x: unknown): boolean =>
  isObj(x) && (x["v"] === 1 || x["v"] === 2);

const cloneTrack = (t: TrackData): TrackData => ({
  ...t,
  done: { ...t.done },
  rituals: { ...t.rituals },
  accepted: { ...t.accepted },
  ...(t.uncleared ? { uncleared: { ...t.uncleared } } : {}),
});

export const clone = (d: PersistedData): PersistedData => ({
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
