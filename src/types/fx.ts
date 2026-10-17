export interface ToastFx {
  kind: "toast";
  msg: string;
  /** Gold pill: badges, rank-ups, station clears. */
  gold: boolean;
}

export interface ConfettiFx {
  kind: "confetti";
  /** Burst size: how big a deal this was. */
  n: number;
}

/** What the engine hands back for the UI to play, in order. */
export type Fx = ToastFx | ConfettiFx;

/** An Fx once the store has stamped it with a play-once id. */
export type StampedFx = Fx & { id: number };

export type StampedToast = Extract<StampedFx, { kind: "toast" }>;
export type StampedConfetti = Extract<StampedFx, { kind: "confetti" }>;
