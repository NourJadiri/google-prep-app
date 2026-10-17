import Icon from "../../shared/Icon";
import "./Chips.css";

interface CaseChipProps {
  /** 1-based, as the chip reads. */
  n: number;
  active: boolean;
  edited: boolean;
  removable: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export default function CaseChip({ n, active, edited, removable, onSelect, onRemove }: CaseChipProps) {
  return (
    <span className={"ws-chip" + (active ? " on" : "")}>
      <button onClick={onSelect}>
        {"Case " + n}
        {edited && <i className="ws-edited" title="Edited — the reference solution will answer it" />}
      </button>
      {removable && (
        <button className="ws-chip-x" onClick={onRemove} aria-label={"Remove case " + n}>
          <Icon name="x" size={11} strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}
