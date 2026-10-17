import { tagLabel, tagStyle, type DeckLook } from "./lib/deckLook";
import "./DeckTag.css";

interface DeckTagProps {
  look: DeckLook;
  n: number;
  selected: boolean;
  platform: number;
}

export default function DeckTag({ look, n, selected, platform }: DeckTagProps) {
  const label = tagLabel(look, n, selected);
  if (label === null) return <span className="dplat">{"P" + platform}</span>;
  return (
    <span className="dtag" style={tagStyle(look)}>
      {label}
    </span>
  );
}
