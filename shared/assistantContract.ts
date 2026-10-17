/* Types and constants only: the app and the Worker both compile this file, so it must import nothing. */

/** The Worker refuses a conversation longer than this. */
export const MAX_TURNS = 40;

export type Role = "user" | "assistant";

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
}
