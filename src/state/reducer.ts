import * as engine from "../lib/engine";
import type { Fx, StampedFx } from "../types";
import type { Action } from "./actions";
import type { AppStateShape } from "./shape";

// Ids are monotonic so <Celebrations> plays each queued effect exactly once.
function withFx(state: AppStateShape, patch: Partial<AppStateShape>, fx: Fx[]): AppStateShape {
  if (!fx || !fx.length) return { ...state, ...patch };
  let seq = state.fxSeq;
  const stamped: StampedFx[] = fx.map((f) => ({ ...f, id: ++seq }));
  return { ...state, ...patch, fx: [...state.fx, ...stamped], fxSeq: seq };
}

const toggle = (list: string[], id: string): string[] =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

function step(state: AppStateShape, action: Action): AppStateShape {
  switch (action.type) {
    case "TAB":
      return { ...state, tab: action.tab };

    case "TOGGLE_DAY":
      return { ...state, openDays: toggle(state.openDays, action.id) };

    case "TOGGLE_PROB": {
      const { data, fx } = engine.toggleProb(state.data, action.id, action);
      return withFx(state, { data }, fx);
    }

    case "ACCEPT": {
      const { data, fx } = engine.acceptProb(state.data, action.id, action);
      return withFx(state, { data }, fx);
    }

    // The new line opens on its current station, like a fresh boot would.
    case "SET_TRACK": {
      const data = engine.setTrack(state.data, action.track);
      if (data === state.data) return state;
      const focus = engine.focusDay(data).id;
      return {
        ...state,
        data,
        openDays: state.openDays.includes(focus) ? state.openDays : [...state.openDays, focus],
      };
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

    // A newer copy replaces the world, so a run scored against the old one must not carry on.
    case "SYNC_ADOPT":
      return withFx(state, { data: action.data, session: null }, [
        { kind: "toast", msg: "Progress synced from the cloud", gold: true },
      ]);

    // The consent card lives on the Me tab, so a scanned link walks the reader there.
    case "LINK_OPEN":
      return { ...state, link: action.link, tab: "me" };

    case "LINK_CLEAR":
      return { ...state, link: null };

    case "WORK_OPEN":
      return { ...state, work: action.id };

    case "WORK_CLOSE":
      return { ...state, work: null };

    // Both lines start over; the reader stays on the one they were riding.
    case "RESET":
      return withFx(
        state,
        { data: engine.setTrack(engine.blank(), state.data.track), session: null },
        [{ kind: "toast", msg: "Fresh start. " + engine.trackOf(state.data).unit + " 1 awaits.", gold: false }]
      );

    case "FX":
      return withFx(state, {}, action.fx);

    case "FX_CONSUMED":
      return state.fx.length ? { ...state, fx: [] } : state;

    default:
      return state;
  }
}

// Whatever changed the data: a station that becomes current opens, and an emptied Redemption deck hands the choice back to Mix.
function settle(prev: AppStateShape, next: AppStateShape): AppStateShape {
  if (next.data === prev.data) return next;
  let out = next;
  const focus = engine.focusDay(next.data).id;
  if (focus !== engine.focusDay(prev.data).id && !out.openDays.includes(focus)) {
    out = { ...out, openDays: [...out.openDays, focus] };
  }
  if (out.deck === "redo" && !out.data.quiz.missed.length) out = { ...out, deck: "mix" };
  return out;
}

export const reducer = (state: AppStateShape, action: Action): AppStateShape =>
  settle(state, step(state, action));
