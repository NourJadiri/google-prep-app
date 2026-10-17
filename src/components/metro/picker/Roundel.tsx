import { cx } from "../../../lib/cx";
import type { DeckLook } from "./lib/deckLook";
import "./Roundel.css";

interface RoundelProps {
  look: DeckLook;
  selected: boolean;
}

export default function Roundel({ look, selected }: RoundelProps) {
  if (look.mix) {
    return (
      <span className="rdl mix">
        <i aria-hidden="true" />
      </span>
    );
  }

  const fill = { background: look.color };
  /* The ring's inset gap is --sunken, the selected row's own background. */
  const style = selected
    ? { ...fill, boxShadow: "0 0 0 2px var(--sunken), 0 0 0 3.5px " + look.color }
    : fill;

  return (
    <span className={cx("rdl", look.onYellow && "onyellow")} style={style}>
      {look.glyph}
    </span>
  );
}
