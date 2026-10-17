/* Types and constants only: the app and the Worker both compile this file, so it must import nothing. */

/** The Worker refuses a conversation longer than this. */
export const MAX_TURNS = 40;

export type Role = "user" | "assistant";

/** The voices the Worker can answer in. The browser picks one; the Worker owns what each one says. */
export const PERSONAS = ["normal", "tough", "catgirl"] as const;
export type Persona = (typeof PERSONAS)[number];

/** The faces Goth catgirl Bana can make; the Worker reads one off each of her answers. */
export const MOODS = ["happy", "angry", "sad", "shocked", "smug", "dizzy"] as const;
/** Kept for one thing: a problem solved by its first submission, with nothing failed before it. */
export const ONE_SHOT_MOOD = "elated";
export type Mood = (typeof MOODS)[number] | typeof ONE_SHOT_MOOD;

export interface Problem {
  title: string;
  source: string;
  statement: string;
}

/** What rides along with a question, each only when it changed since the last one. */
export interface Snapshot {
  /** The editor's code. */
  code?: string;
  /** The latest run's report. */
  run?: string;
}

/** Only user turns carry a snapshot. */
export interface Turn extends Snapshot {
  role: Role;
  text: string;
}

export interface AskRequest {
  problem: Problem;
  turns: Turn[];
  /** Absent from older clients: "normal". */
  persona?: Persona;
  /** The problem was one-shot: its first submission passed with nothing failed before it. */
  oneShot?: boolean;
}
