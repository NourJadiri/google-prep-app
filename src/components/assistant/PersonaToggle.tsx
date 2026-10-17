import type { Persona } from "../../../shared/assistantContract";
import { cx } from "../../lib/cx";
import Icon from "../shared/Icon";
import { PERSONA_LOOKS } from "./lib/personas";
import "./PersonaToggle.css";

interface Props {
  value: Persona;
  onChange: (persona: Persona) => void;
}

export default function PersonaToggle({ value, onChange }: Props) {
  return (
    <div className="asst-voices" role="group" aria-label="Bana's mode">
      {PERSONA_LOOKS.map((p) => (
        <button
          key={p.id}
          type="button"
          className={cx("asst-voice", value === p.id && "on")}
          aria-pressed={value === p.id}
          aria-label={p.label}
          title={p.label}
          onClick={() => onChange(p.id)}
        >
          <Icon name={p.icon} size={13} />
        </button>
      ))}
    </div>
  );
}
