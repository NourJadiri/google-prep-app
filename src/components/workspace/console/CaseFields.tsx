import Hint from "./Hint";
import "./CaseFields.css";

interface CaseFieldsProps {
  names: string[];
  fields: Record<string, string>;
  onEdit: (name: string, value: string) => void;
}

const COLS = 64;

export default function CaseFields({ names, fields, onEdit }: CaseFieldsProps) {
  return (
    <div className="ws-fields">
      {names.map((n) => (
        <label key={n} className="ws-field">
          <span>{n} =</span>
          <textarea
            value={fields[n] ?? ""}
            spellCheck={false}
            rows={Math.min(6, Math.max(1, Math.ceil((fields[n] ?? "").length / COLS)))}
            onChange={(e) => onEdit(n, e.target.value)}
          />
        </label>
      ))}
      <Hint>JSON or Python literals. Edited and added cases are answered by the reference solution.</Hint>
    </div>
  );
}
