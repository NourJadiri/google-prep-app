import { DECKS } from "../../../data/questions";
import { deckStat } from "../../../lib/engine";
import type { DeckId, PersistedData } from "../../../types";
import BoardHead from "./BoardHead";
import DeckRow from "./DeckRow";
import "./DepartureBoard.css";

interface DepartureBoardProps {
  data: PersistedData;
  selected: DeckId;
  onSelect: (deck: DeckId) => void;
}

export default function DepartureBoard({ data, selected, onSelect }: DepartureBoardProps) {
  return (
    <div className="dboard" role="group" aria-label="Choose a deck">
      <BoardHead />
      {DECKS.map((deck, i) => (
        <DeckRow
          key={deck.id}
          deck={deck}
          platform={i + 1}
          stat={deckStat(data, deck.id)}
          selected={selected === deck.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
