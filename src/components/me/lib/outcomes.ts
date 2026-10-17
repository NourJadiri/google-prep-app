import type { SyncOutcome } from "../../../lib/sync";

export type Outcome = SyncOutcome | "invalid";

export interface Reaction {
  confetti: boolean;
  toast?: { msg: string; gold: boolean };
}

export const NOT_A_CODE = "That doesn't look like a sync code";
const CLOUD_DOWN = "Can't reach the cloud — progress is safe here";
const CONNECT_QUEUED = "Connected — cloud unreachable right now, will keep trying";

const say = (msg: string, gold = false) => ({ msg, gold });

/** Connecting to a code, typed or scanned: the cloud copy wins. "adopted" already toasts from the store. */
export function joinedReaction(out: SyncOutcome): Reaction {
  switch (out) {
    case "adopted":
      return { confetti: true };
    case "pushed":
      return { confetti: true, toast: say("Connected — this device seeded the cloud", true) };
    case "clean":
      return { confetti: true, toast: say("Connected", true) };
    case "failed":
      return { confetti: false, toast: say(CONNECT_QUEUED) };
  }
}

/** Sending this device's progress under a code. Only a send that moved something is worth confetti. */
export function sentReaction(out: SyncOutcome): Reaction {
  switch (out) {
    case "adopted":
      return { confetti: true };
    case "pushed":
      return { confetti: true, toast: say("Progress sent — devices linked", true) };
    case "clean":
      return { confetti: false, toast: say("Already in sync") };
    case "failed":
      /* claim leaves the retry armed, so this is a delay, not a failure. */
      return { confetti: false, toast: say("Will send when the cloud is reachable") };
  }
}

/** The other device showed up while the sheet waited. The sheet's own Linked card is the receipt, so only a failure speaks. */
export function arrivedReaction(out: Outcome, wasOn: boolean): Reaction {
  return out === "failed"
    ? { confetti: false, toast: say(wasOn ? CLOUD_DOWN : CONNECT_QUEUED) }
    : { confetti: true };
}

/** "Sync now". */
export function syncedReaction(out: SyncOutcome): Reaction {
  switch (out) {
    case "pushed":
      return { confetti: false, toast: say("Pushed to the cloud", true) };
    case "clean":
      return { confetti: false, toast: say("Already in sync") };
    case "failed":
      return { confetti: false, toast: say(CLOUD_DOWN) };
    case "adopted":
      return { confetti: false };
  }
}
