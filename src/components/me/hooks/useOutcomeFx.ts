import { useMemo } from "react";
import { useApp } from "../../../state/AppState";
import type { SyncOutcome } from "../../../lib/sync";
import {
  NOT_A_CODE,
  arrivedReaction,
  joinedReaction,
  sentReaction,
  syncedReaction,
  type Outcome,
  type Reaction,
} from "../lib/outcomes";

/** What each sync outcome says and celebrates. Stable across renders, so effects can depend on it. */
export function useOutcomeFx() {
  const { actions } = useApp();
  return useMemo(() => {
    const play = ({ confetti, toast }: Reaction): void => {
      if (confetti) actions.celebrate({ kind: "confetti", n: 12 });
      if (toast) actions.toast(toast.msg, toast.gold);
    };
    const notACode = (): void => actions.toast(NOT_A_CODE);
    /** False when the code was refused, after saying so; the caller keeps its form or card up. */
    const settle = (out: Outcome, react: (o: SyncOutcome) => Reaction): boolean => {
      if (out === "invalid") {
        notACode();
        return false;
      }
      play(react(out));
      return true;
    };
    return {
      notACode,
      joined: (out: Outcome) => settle(out, joinedReaction),
      sent: (out: Outcome) => settle(out, sentReaction),
      arrived: (out: Outcome, wasOn: boolean): void => play(arrivedReaction(out, wasOn)),
      synced: (out: SyncOutcome): void => play(syncedReaction(out)),
    };
  }, [actions]);
}
