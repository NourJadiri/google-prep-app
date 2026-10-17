import type { CSSProperties } from "react";
import type { DeckId } from "../../../../types";

interface LookBase {
  /** Tag text colour. Yellow is never used as text, so the yellow line pairs with --med. */
  text: string;
  /** Redemption, the delayed service: closed until you owe it cards. */
  delayed?: true;
}

interface MixLook extends LookBase {
  /** The interchange: drawn as the four-colour roundel, scored across every line. */
  mix: true;
}

interface LineLook extends LookBase {
  mix?: undefined;
  color: string;
  glyph: string;
  /** The yellow line's letter stays dark in both themes. */
  onYellow?: true;
}

export type DeckLook = MixLook | LineLook;

const LOOK: Record<DeckId, DeckLook> = {
  mix: { mix: true, text: "var(--ink)" },
  graphs: { color: "var(--blue)", glyph: "G", text: "var(--blue)" },
  bt: { color: "var(--red)", glyph: "B", text: "var(--red)" },
  dp: { color: "var(--yellow)", glyph: "D", text: "var(--med)", onYellow: true },
  ds: { color: "var(--green)", glyph: "H", text: "var(--green)" },
  redo: { color: "var(--med)", glyph: "R", text: "var(--med)", delayed: true },
};

export const deckLook = (id: DeckId): DeckLook => LOOK[id];

export function subline(look: DeckLook, n: number, pct: number | null): string {
  if (look.delayed) return n ? n + " missed · win them back" : "no misses yet — clean sheet";
  if (look.mix) return n + " cards · " + (pct === null ? "weakest first" : pct + "% · weakest first");
  return n + " cards · " + (pct === null ? "not yet ridden" : pct + "% right");
}

export const isClosed = (look: DeckLook, n: number): boolean => !!look.delayed && n === 0;

/** The pill on a row, or null when the row shows its platform instead. */
export function tagLabel(look: DeckLook, n: number, selected: boolean): string | null {
  if (selected) return "NOW BOARDING";
  return look.delayed && n > 0 ? "DELAYED · " + n : null;
}

export const tagStyle = (look: DeckLook): CSSProperties => ({
  color: look.text,
  background: "color-mix(in srgb, " + look.text + " 14%, transparent)",
});
