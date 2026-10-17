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

const count = (x: unknown): number => Math.max(0, Math.floor(num(x)));

const isDay = (x: unknown): x is string => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x);

/** The entries of `x` whose value passes `keep`, as a fresh map. */
function entries<T>(x: unknown, keep: (v: unknown) => v is T): Record<string, T> {
  if (!isObj(x)) return {};
  return Object.fromEntries(Object.entries(x).filter((e): e is [string, T] => keep(e[1])));
}

const isTrue = (v: unknown): v is true => v === true;
const isStamp = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v > 0;

function normPerQ(x: unknown): Record<string, QStat> {
  const stats = entries(x, isObj);
  return Object.fromEntries(
    Object.entries(stats).map(([id, s]) => [id, { seen: count(s["seen"]), right: count(s["right"]) }])
  );
}

function normQuiz(x: unknown): QuizData {
  const q = { ...(blankQuiz() as unknown as Loose), ...(isObj(x) ? x : {}) };
  return {
    ...(q as unknown as QuizData),
    answered: num(q["answered"]),
    correct: num(q["correct"]),
    perQ: normPerQ(q["perQ"]),
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
    ...(isObj(uncleared) ? { uncleared: entries(uncleared, isTrue) } : {}),
    xp: xpOf(t["xp"]),
    done: entries(t["done"], isTrue),
    rituals: entries(t["rituals"], isDay),
    accepted: Object.fromEntries(
      Object.entries(accepted).filter(([, v]) => typeof v === "number" && Number.isFinite(v))
    ) as Record<string, number>,
  };
}

// Only a real stamp counts, so the Me tab's grid and the award rule can't disagree about a badge.
const normBadges = (x: unknown): Record<string, number> => entries(x, isStamp);

function normStreak(x: unknown) {
  const s = isObj(x) ? x : {};
  const cur = count(s["cur"]);
  return { ...s, last: isDay(s["last"]) ? s["last"] : "", cur, best: Math.max(cur, count(s["best"])) };
}

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
