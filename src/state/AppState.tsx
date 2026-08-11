import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type { ReactNode } from "react";
import * as engine from "../lib/engine";
import * as storage from "../lib/storage";
import { todayStr } from "../lib/dates";
import type { DeckId, Fx, PersistedData, Session, StampedFx, Tab } from "../types";

/* One store for the whole app. `data` is the persisted schema and nothing else
 * — the export in the Me tab is literally JSON.stringify(state.data), which is
 * what lets a reference-app export import cleanly here.
 *
 * Everything the reference kept in module-level globals (the open day, the
 * running quiz, which templates are revealed) lives here too, so it survives a
 * tab switch exactly the way it did when the views were hidden with CSS.
 *
 * The reducer delegates every rule to lib/engine, which hands back the new
 * state plus an ordered queue of celebrations for <Celebrations> to play.
 * Action creators stamp `today`/`now` so the reducer never reads the clock.
 */

export interface AppStateShape {
  data: PersistedData;
  tab: Tab;
  /** Day ids currently expanded on the line. */
  openDays: string[];
  deck: DeckId;
  session: Session | null;
  /** Template ids expanded in the dojo. */
  openTpl: string[];
  /** Template ids whose code has been un-blurred, session-scoped on purpose. */
  shownTpl: string[];
  /** Celebrations waiting to be drained by <Celebrations>. */
  fx: StampedFx[];
  fxSeq: number;
}

/** Clock readings taken by the action creator, so the reducer stays pure. */
interface Stamp {
  today: string;
  now: number;
}

export type Action =
  | { type: "TAB"; tab: Tab }
  | { type: "TOGGLE_DAY"; id: string }
  | ({ type: "TOGGLE_PROB"; id: string } & Stamp)
  | ({ type: "TOGGLE_RITUAL"; dayId: string } & Stamp)
  | { type: "SET_DECK"; deck: DeckId }
  | { type: "START_RUN" }
  | ({ type: "ANSWER"; slot: number } & Stamp)
  | ({ type: "NEXT" } & Stamp)
  | { type: "QUIT_RUN" }
  | { type: "TOGGLE_TPL"; id: string }
  | { type: "REVEAL_TPL"; id: string }
  | { type: "IMPORT"; data: PersistedData }
  | { type: "RESET" }
  | { type: "FX"; fx: Fx[] }
  | { type: "FX_CONSUMED" };

function boot(): AppStateShape {
  const data = engine.normalize(storage.load());
  return {
    data,
    tab: "line",
    openDays: [engine.focusDay(data).id], // current station starts expanded
    deck: "mix",
    session: null,
    openTpl: [],
    shownTpl: [],
    fx: [],
    fxSeq: 0,
  };
}

/* Appends celebrations with ids so <Celebrations> can play each exactly once. */
function withFx(
  state: AppStateShape,
  patch: Partial<AppStateShape>,
  fx: Fx[]
): AppStateShape {
  if (!fx || !fx.length) return { ...state, ...patch };
  let seq = state.fxSeq;
  const stamped: StampedFx[] = fx.map((f) => ({ ...f, id: ++seq }));
  return { ...state, ...patch, fx: [...state.fx, ...stamped], fxSeq: seq };
}

const toggle = (list: string[], id: string): string[] =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

function reducer(state: AppStateShape, action: Action): AppStateShape {
  switch (action.type) {
    case "TAB":
      return { ...state, tab: action.tab };

    case "TOGGLE_DAY":
      return { ...state, openDays: toggle(state.openDays, action.id) };

    case "TOGGLE_PROB": {
      const { data, fx } = engine.toggleProb(state.data, action.id, action);
      return withFx(state, { data }, fx);
    }

    case "TOGGLE_RITUAL": {
      const { data, fx } = engine.toggleRitual(state.data, action.dayId, action);
      return withFx(state, { data }, fx);
    }

    case "SET_DECK":
      return { ...state, deck: action.deck };

    case "START_RUN": {
      const { session, fx } = engine.startSession(state.data, state.deck);
      return withFx(state, session ? { session } : {}, fx);
    }

    case "ANSWER": {
      const { data, session, fx } = engine.answerCard(
        state.data,
        state.session,
        action.slot,
        action
      );
      return withFx(state, { data, session }, fx);
    }

    case "NEXT": {
      const { data, session, fx } = engine.nextCard(state.data, state.session, action);
      return withFx(state, { data, session }, fx);
    }

    case "QUIT_RUN":
      return { ...state, session: null };

    case "TOGGLE_TPL":
      return { ...state, openTpl: toggle(state.openTpl, action.id) };

    case "REVEAL_TPL":
      return state.shownTpl.includes(action.id)
        ? state
        : { ...state, shownTpl: [...state.shownTpl, action.id] };

    case "IMPORT":
      return withFx(state, { data: action.data }, [
        { kind: "toast", msg: "Progress imported", gold: true },
      ]);

    case "RESET":
      return withFx(state, { data: engine.blank(), session: null }, [
        { kind: "toast", msg: "Fresh line. Day 1 awaits.", gold: false },
      ]);

    /* Celebrations raised outside the engine — the mock clock, a failed import. */
    case "FX":
      return withFx(state, {}, action.fx);

    case "FX_CONSUMED":
      return state.fx.length ? { ...state, fx: [] } : state;

    default:
      return state;
  }
}

/** Everything the UI is allowed to do, with the clock already read. */
export interface Actions {
  setTab: (tab: Tab) => void;
  toggleDay: (id: string) => void;
  toggleProb: (id: string) => void;
  toggleRitual: (dayId: string) => void;
  setDeck: (deck: DeckId) => void;
  startRun: () => void;
  answer: (slot: number) => void;
  next: () => void;
  quitRun: () => void;
  toggleTpl: (id: string) => void;
  revealTpl: (id: string) => void;
  importData: (data: PersistedData) => void;
  reset: () => void;
  celebrate: (...fx: Fx[]) => void;
  toast: (msg: string, gold?: boolean) => void;
  consumeFx: () => void;
}

interface AppValue {
  state: AppStateShape;
  actions: Actions;
}

const AppCtx = createContext<AppValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, boot);

  /* Debounced persistence. The first render is the blob we just loaded, so
     there is nothing to write back yet. */
  const firstSave = useRef(true);
  useEffect(() => {
    if (firstSave.current) {
      firstSave.current = false;
      return;
    }
    storage.save(state.data);
  }, [state.data]);

  /* iOS can discard a backgrounded tab without ever firing unload. */
  useEffect(() => {
    const flush = () => storage.flush();
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, []);

  const actions = useMemo<Actions>(() => {
    const stamp = (): Stamp => ({ today: todayStr(), now: Date.now() });
    return {
      setTab: (tab) => dispatch({ type: "TAB", tab }),
      toggleDay: (id) => dispatch({ type: "TOGGLE_DAY", id }),
      toggleProb: (id) => dispatch({ type: "TOGGLE_PROB", id, ...stamp() }),
      toggleRitual: (dayId) => dispatch({ type: "TOGGLE_RITUAL", dayId, ...stamp() }),
      setDeck: (deck) => dispatch({ type: "SET_DECK", deck }),
      startRun: () => dispatch({ type: "START_RUN" }),
      answer: (slot) => dispatch({ type: "ANSWER", slot, ...stamp() }),
      next: () => dispatch({ type: "NEXT", ...stamp() }),
      quitRun: () => dispatch({ type: "QUIT_RUN" }),
      toggleTpl: (id) => dispatch({ type: "TOGGLE_TPL", id }),
      revealTpl: (id) => dispatch({ type: "REVEAL_TPL", id }),
      importData: (data) => dispatch({ type: "IMPORT", data }),
      reset: () => dispatch({ type: "RESET" }),
      celebrate: (...fx) => dispatch({ type: "FX", fx }),
      toast: (msg, gold = false) =>
        dispatch({ type: "FX", fx: [{ kind: "toast", msg, gold }] }),
      consumeFx: () => dispatch({ type: "FX_CONSUMED" }),
    };
  }, []);

  const value = useMemo<AppValue>(() => ({ state, actions }), [state, actions]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): AppValue {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
