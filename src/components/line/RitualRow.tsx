import { RITUAL_XP } from "../../data/plan";
import { cx } from "../../lib/cx";
import Icon from "../shared/Icon";
import XpValue from "../ui/XpValue";
import "./pcheck.css";
import "./RitualRow.css";

interface RitualRowProps {
  ritual: string;
  /** The day's colour, for the ticked circle. */
  color: string;
  done: boolean;
  onToggle: () => void;
}

export default function RitualRow({ ritual, color, done, onToggle }: RitualRowProps) {
  return (
    <button className={cx("ritual", done && "done")} onClick={onToggle} aria-pressed={done}>
      <span className="pcheck" style={done ? { background: color, borderColor: color, color: "#fff" } : undefined}>
        <Icon name="check" size={12} strokeWidth={3} />
      </span>
      <span style={{ flex: 1, textAlign: "left" }}>{ritual}</span>
      <XpValue>{"+" + RITUAL_XP}</XpValue>
    </button>
  );
}
