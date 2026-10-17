// The persisted blob is the export format, a compatibility promise: a blob written
// by an older build, or by the original single-file app, must still parse.

import type { TrackId } from "./content";

export interface QStat {
  seen: number;
  right: number;
}

export interface QuizData {
  answered: number;
  correct: number;
  /** Sparse: only cards you have seen. */
  perQ: Record<string, QStat>;
  /** Ids of cards answered wrong and not yet redeemed. */
  missed: string[];
  bestStreak: number;
  sessions: number;
  perfect: number;
  bugRight: number;
}

export interface StreakData {
  /** Last day anything earned XP, "YYYY-MM-DD"; "" before the first. */
  last: string;
  cur: number;
  best: number;
}

/** Problem and day ids are unique across lines, so a stale id never lands on the wrong one. */
export interface TrackData {
  xp: number;
  /** Sparse: absent means not done. */
  done: Record<string, true>;
  /** Day id -> the "YYYY-MM-DD" it was logged. Sparse. */
  rituals: Record<string, string>;
  /** Problem id -> epoch ms when every test first passed in the workspace.
   *  Sparse; outlives unticking, because it happened. */
  accepted: Record<string, number>;
  /** XP held before an untick took a rank back; gone once XP is back up to it. */
  peak?: number;
  /** Day id -> true for a cleared station an untick has opened again, so
   *  re-clearing it is not celebrated twice. */
  uncleared?: Record<string, true>;
}

export interface PersistedData {
  v: 2;
  /** The line showing. Synced: it is where you are, not a setting. */
  track: TrackId;
  tracks: Record<TrackId, TrackData>;
  /** Quiz, badges and streak are shared across lines. */
  quiz: QuizData;
  /** Badge id -> epoch ms awarded. Badges are never revoked. */
  badges: Record<string, number>;
  streak: StreakData;
}

/** The blob before the line split; `normalize` upgrades it on the way in. */
export interface PersistedDataV1 {
  v: 1;
  xp: number;
  done: Record<string, true>;
  rituals: Record<string, string>;
  quiz: QuizData;
  badges: Record<string, number>;
  streak: StreakData;
}
