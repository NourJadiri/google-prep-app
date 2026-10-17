import type { SheetMode } from "./lib/mode";
import "./ModeToggle.css";

interface ModeToggleProps {
  mode: SheetMode;
  onChange: (mode: SheetMode) => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const get = mode === "get";
  return (
    <div className="segtoggle" role="group" aria-label="What this device should do">
      <button aria-pressed={get} onClick={() => onChange("get")}>
        Get progress
      </button>
      <button aria-pressed={!get} onClick={() => onChange("send")}>
        Send progress
      </button>
    </div>
  );
}
