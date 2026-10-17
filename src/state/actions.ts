import type { DeckId, Fx, LinkDirective, PersistedData, Tab, TrackId } from "../types";

/** Clock readings taken by the action creator, so the reducer stays pure. */
export interface Stamp {
  today: string;
  now: number;
}

export type Action =
  | { type: "TAB"; tab: Tab }
  | { type: "TOGGLE_DAY"; id: string }
  | ({ type: "TOGGLE_PROB"; id: string } & Stamp)
  | ({ type: "ACCEPT"; id: string } & Stamp)
  | { type: "SET_TRACK"; track: TrackId }
  | ({ type: "TOGGLE_RITUAL"; dayId: string } & Stamp)
  | { type: "SET_DECK"; deck: DeckId }
  | { type: "START_RUN" }
  | ({ type: "ANSWER"; slot: number } & Stamp)
  | ({ type: "NEXT" } & Stamp)
  | { type: "QUIT_RUN" }
  | { type: "TOGGLE_TPL"; id: string }
  | { type: "REVEAL_TPL"; id: string }
  | { type: "IMPORT"; data: PersistedData }
  | { type: "SYNC_ADOPT"; data: PersistedData }
  | { type: "LINK_OPEN"; link: LinkDirective }
  | { type: "LINK_CLEAR" }
  | { type: "WORK_OPEN"; id: string }
  | { type: "WORK_CLOSE" }
  | { type: "RESET" }
  | { type: "FX"; fx: Fx[] }
  | { type: "FX_CONSUMED" };
