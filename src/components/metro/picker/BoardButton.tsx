import { DECKS } from "../../../data/questions";
import { STOPS } from "../../../lib/engine";
import type { DeckId } from "../../../types";
import Icon from "../../shared/Icon";
import "./BoardButton.css";

interface BoardButtonProps {
  deck: DeckId;
  onBoard: () => void;
}

export default function BoardButton({ deck, onBoard }: BoardButtonProps) {
  const name = DECKS.find((d) => d.id === deck)?.n ?? "Mix";

  return (
    <button className="board" onClick={onBoard}>
      <Icon name="train" size={18} />
      {"Board " + name + " — " + STOPS + " stops"}
    </button>
  );
}
