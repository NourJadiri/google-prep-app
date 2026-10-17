import * as engine from "../lib/engine";
import * as storage from "../lib/storage";
import type { DeckId, LinkDirective, PersistedData, Session, StampedFx, Tab } from "../types";

export interface AppStateShape {
  /** The persisted schema and nothing else: the Me tab exports it verbatim. */
  data: PersistedData;
  tab: Tab;
  openDays: string[];
  deck: DeckId;
  session: Session | null;
  openTpl: string[];
  /** Template ids whose code is un-blurred; session-scoped on purpose. */
  shownTpl: string[];
  /** In the store, not the Me tab, because it can arrive at boot before that tab ever mounts. */
  link: LinkDirective | null;
  work: string | null;
  fx: StampedFx[];
  fxSeq: number;
}

export function boot(): AppStateShape {
  const data = engine.normalize(storage.load());
  return {
    data,
    tab: "line",
    openDays: [engine.focusDay(data).id],
    deck: "mix",
    session: null,
    openTpl: [],
    shownTpl: [],
    link: null,
    work: null,
    fx: [],
    fxSeq: 0,
  };
}
