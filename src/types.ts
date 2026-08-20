/* The vocabulary of the app, in one place.
 *
 * Two families live here and they are deliberately kept apart:
 *
 *   Content  — PLAN, Q, TPL, RANKS, BADGES. Ported verbatim from the reference
 *              and never mutated. These types describe what the reference
 *              actually wrote, which is why so many fields are optional.
 *
 *   State    — PersistedData and everything under it. This is the export
 *              format, so its shape is a compatibility promise: a blob written
 *              by the original single-file app must still parse as one of these.
 */

/* ------------------------------- content -------------------------------- */

/** A list that is guaranteed non-empty, so index 0 always answers. Lets the
 *  "current rank" and "last day" lookups resolve without a fake undefined
 *  branch, while every id-keyed lookup stays honestly optional. */
export type NonEmpty<T> = readonly [T, ...T[]];

/** Difficulty chip on a problem row. */
export type Diff = "E" | "M" | "H";

/** The topic a day drills and a quiz card belongs to. Mock days, and week-2
 *  pattern days with no quiz deck of their own, are "mix". */
export type Phase = "graphs" | "bt" | "dp" | "ds" | "mix";

/** Quiz card flavour: pattern match, bug hunt, missing line, complexity. */
export type QType = "pat" | "bug" | "line" | "cx";

export interface Problem {
  id: string;
  n: string;
  diff: Diff;
  /** Every problem but the timed mocks links to LeetCode by slug. */
  slug?: string;
  /** The timed mocks carry a full url instead. */
  url?: string;
  /** Overrides the difficulty's XP; only the timed mocks set it. */
  xp?: number;
  /** Marks the day's last problem as a warm-up. Week 1 warms seed the heaps
   *  and tries to come; week 2 warms re-drill a week-1 pattern. */
  warm?: true;
}

export interface Day {
  id: string;
  /** Day number, 1-14. */
  d: number;
  /** Station name on the line. */
  stn: string;
  /** CSS custom property reference, e.g. "var(--blue)". */
  color: string;
  ph: Phase;
  /** Marks a station that ends in the timed mock; DayCard mounts the clock. */
  mock?: true;
  name: string;
  note: string;
  ritual: string;
  probs: Problem[];
}

export interface Question {
  id: string;
  t: QType;
  ph: Exclude<Phase, "mix">;
  q: string;
  /** Options, stored answer-first. Never displayed in this order. */
  o: string[];
  /** Index of the correct option *before* shuffling — always 0. */
  a: number;
  /** The explanation shown on reveal. */
  x: string;
  /** Only bug-hunt and missing-line cards carry a snippet. */
  code?: string;
}

export interface Template {
  /** Group heading; consecutive templates sharing one are printed under it. */
  g: string;
  id: string;
  n: string;
  tag: string;
  note: string;
  code: string;
}

/** [name, XP threshold] — a tuple in the reference, kept as one. */
export type Rank = readonly [name: string, need: number];

export interface Badge {
  id: string;
  /** Emoji shown in the grid. */
  ic: string;
  n: string;
  /** How it's earned, shown as the tooltip. */
  d: string;
}

export interface Deck {
  id: DeckId;
  n: string;
}

/** A quiz deck: the four phases, plus "mix" and the missed-card "redo" deck. */
export type DeckId = Phase | "redo";

/* -------------------------------- state --------------------------------- */

/** Per-card hit rate, driving the weakest-first weighting in pickWeighted. */
export interface QStat {
  seen: number;
  right: number;
}

export interface QuizData {
  answered: number;
  correct: number;
  /** Sparse: only cards you have actually seen. */
  perQ: Record<string, QStat>;
  /** Ids of cards answered wrong and not yet redeemed. */
  missed: string[];
  bestStreak: number;
  sessions: number;
  perfect: number;
  bugRight: number;
}

export interface StreakData {
  /** Last day anything earned XP, as "YYYY-MM-DD". "" before the first. */
  last: string;
  cur: number;
  best: number;
}

/** The persisted blob, and the entire export format. Bump `v` and you break
 *  compatibility with exports from the original single-file app. */
export interface PersistedData {
  v: 1;
  xp: number;
  /** Problem id -> true. Sparse; absent means not done. */
  done: Record<string, true>;
  /** Day id -> the "YYYY-MM-DD" it was logged. Sparse. */
  rituals: Record<string, string>;
  quiz: QuizData;
  /** Badge id -> the timestamp it was awarded. Badges are never revoked. */
  badges: Record<string, number>;
  streak: StreakData;
}

/* ----------------------------- celebrations ------------------------------ */

export interface ToastFx {
  kind: "toast";
  msg: string;
  /** Gold pill: badges, rank-ups, station clears. */
  gold: boolean;
}

export interface ConfettiFx {
  kind: "confetti";
  /** Burst size, which is how the app says how big a deal this was. */
  n: number;
}

/** What the engine hands back for the UI to play, in order. */
export type Fx = ToastFx | ConfettiFx;

/** An Fx once the store has stamped it with a play-once id. */
export type StampedFx = Fx & { id: number };

/* -------------------------------- a run --------------------------------- */

export type RunPhase = "ask" | "reveal" | "done";

export interface Session {
  deck: DeckId;
  /** The ten card ids, in the order they'll be shown. */
  ids: string[];
  /** Index into `ids`. */
  i: number;
  streak: number;
  best: number;
  right: number;
  /** XP earned in this run alone. */
  xp: number;
  phase: RunPhase;
  /** One entry per answered card, oldest first. */
  results: boolean[];
  /** Display permutation for the current card: order[slot] is the stored
   *  index of the option sitting in that slot. Re-dealt on every card. */
  order: number[];
  /** Which slot the reader tapped, once revealed. */
  picked: number | null;
}

/* --------------------------------- misc ---------------------------------- */

export type Tab = "line" | "metro" | "dojo" | "me";

/** A device-linking instruction carried by a QR code or a share link: what
 *  THIS device should do with the code — send its progress under it, or
 *  receive (adopt) what the cloud holds. Consented to in the UI, never acted
 *  on silently. */
export interface LinkDirective {
  code: string;
  dir: "send" | "recv";
}

/** Clock and randomness, injected so every rule stays a pure function. */
export interface EngineOpts {
  /** Today as "YYYY-MM-DD". */
  today?: string;
  now?: number;
  rng?: () => number;
}

/** A celebration already stamped and narrowed to one kind, for the two
 *  short-lived lists <Celebrations> drains the queue into. */
export type StampedToast = Extract<StampedFx, { kind: "toast" }>;
export type StampedConfetti = Extract<StampedFx, { kind: "confetti" }>;
