import type { Spec } from "../../../data/problems";
import { isEdited, type CaseDraft } from "../lib/runPlan";
import Icon from "../../shared/Icon";
import LinkButton from "../../ui/LinkButton";
import CaseChip from "./CaseChip";
import "./Chips.css";

interface CaseChipsProps {
  spec: Spec;
  cases: CaseDraft[];
  active: number;
  onSelect: (i: number) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
  onReset: () => void;
}

export default function CaseChips({ spec, cases, active, onSelect, onRemove, onAdd, onReset }: CaseChipsProps) {
  return (
    <div className="ws-chips">
      {cases.map((c, i) => (
        <CaseChip
          key={c.key}
          n={i + 1}
          active={i === active}
          edited={isEdited(spec, c) && c.origin !== null}
          removable={cases.length > 1 && i === active}
          onSelect={() => onSelect(i)}
          onRemove={() => onRemove(i)}
        />
      ))}
      <button className="ws-chip add" onClick={onAdd} aria-label="Add a case" title="Add a case">
        <Icon name="plus" size={13} />
      </button>
      <LinkButton onClick={onReset} title="Back to the problem's examples">
        Reset
      </LinkButton>
    </div>
  );
}
