export type OptionState = "right" | "wrong" | "dim";

interface OptionFacts {
  revealed: boolean;
  /** The option's stored index (the run's `order[slot]`). */
  stored: number;
  /** The slot it is shown in. */
  slot: number;
  /** The correct option, as a stored index. */
  answer: number;
  /** The slot the player tapped, if any. */
  picked: number | null;
}

/** How an option looks: null while the card is still open, else right, the wrong pick, or dimmed. */
export function optionState({ revealed, stored, slot, answer, picked }: OptionFacts): OptionState | null {
  if (!revealed) return null;
  if (stored === answer) return "right";
  if (slot === picked) return "wrong";
  return "dim";
}
