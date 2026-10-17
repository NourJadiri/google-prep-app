import { cx } from "../../../lib/cx";
import type { DeckStat } from "../../../lib/engine";
import type { Deck, DeckId } from "../../../types";
import DeckTag from "./DeckTag";
import Roundel from "./Roundel";
import { deckLook, isClosed, subline } from "./lib/deckLook";
import "./DeckRow.css";

interface DeckRowProps {
  deck: Deck;
  /** The row's platform number, from 1. */
  platform: number;
  stat: DeckStat;
  selected: boolean;
  onSelect: (deck: DeckId) => void;
}

export default function DeckRow({ deck, platform, stat, selected, onSelect }: DeckRowProps) {
  const look = deckLook(deck.id);
  const { n, pct } = stat;

  return (
    <button
      className={cx("drow", selected && "sel")}
      disabled={isClosed(look, n)}
      aria-pressed={selected}
      onClick={() => onSelect(deck.id)}
    >
      <Roundel look={look} selected={selected} />
      <span className="drow-info">
        <span className="drow-name">{deck.n}</span>
        <span className="drow-sub">{subline(look, n, pct)}</span>
      </span>
      <DeckTag look={look} n={n} selected={selected} platform={platform} />
    </button>
  );
}
