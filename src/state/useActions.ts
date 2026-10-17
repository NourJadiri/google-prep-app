import { useMemo } from "react";
import type { Dispatch } from "react";
import { todayStr } from "../lib/dates";
import type { DeckId, Fx, LinkDirective, PersistedData, Tab, TrackId } from "../types";
import type { Action, Stamp } from "./actions";

export interface Actions {
  setTab: (tab: Tab) => void;
  toggleDay: (id: string) => void;
  toggleProb: (id: string) => void;
  /** Every test passed in the workspace. */
  accept: (id: string) => void;
  setTrack: (track: TrackId) => void;
  toggleRitual: (dayId: string) => void;
  setDeck: (deck: DeckId) => void;
  startRun: () => void;
  answer: (slot: number) => void;
  next: () => void;
  quitRun: () => void;
  toggleTpl: (id: string) => void;
  revealTpl: (id: string) => void;
  importData: (data: PersistedData) => void;
  openLink: (link: LinkDirective) => void;
  clearLink: () => void;
  openWork: (id: string) => void;
  closeWork: () => void;
  reset: () => void;
  celebrate: (...fx: Fx[]) => void;
  toast: (msg: string, gold?: boolean) => void;
  consumeFx: () => void;
}

export function useActions(dispatch: Dispatch<Action>): Actions {
  return useMemo<Actions>(() => {
    const stamp = (): Stamp => ({ today: todayStr(), now: Date.now() });
    return {
      setTab: (tab) => dispatch({ type: "TAB", tab }),
      toggleDay: (id) => dispatch({ type: "TOGGLE_DAY", id }),
      toggleProb: (id) => dispatch({ type: "TOGGLE_PROB", id, ...stamp() }),
      accept: (id) => dispatch({ type: "ACCEPT", id, ...stamp() }),
      setTrack: (track) => dispatch({ type: "SET_TRACK", track }),
      toggleRitual: (dayId) => dispatch({ type: "TOGGLE_RITUAL", dayId, ...stamp() }),
      setDeck: (deck) => dispatch({ type: "SET_DECK", deck }),
      startRun: () => dispatch({ type: "START_RUN" }),
      answer: (slot) => dispatch({ type: "ANSWER", slot, ...stamp() }),
      next: () => dispatch({ type: "NEXT", ...stamp() }),
      quitRun: () => dispatch({ type: "QUIT_RUN" }),
      toggleTpl: (id) => dispatch({ type: "TOGGLE_TPL", id }),
      revealTpl: (id) => dispatch({ type: "REVEAL_TPL", id }),
      importData: (data) => dispatch({ type: "IMPORT", data }),
      openLink: (link) => dispatch({ type: "LINK_OPEN", link }),
      clearLink: () => dispatch({ type: "LINK_CLEAR" }),
      openWork: (id) => dispatch({ type: "WORK_OPEN", id }),
      closeWork: () => dispatch({ type: "WORK_CLOSE" }),
      reset: () => dispatch({ type: "RESET" }),
      celebrate: (...fx) => dispatch({ type: "FX", fx }),
      toast: (msg, gold = false) =>
        dispatch({ type: "FX", fx: [{ kind: "toast", msg, gold }] }),
      consumeFx: () => dispatch({ type: "FX_CONSUMED" }),
    };
  }, [dispatch]);
}
