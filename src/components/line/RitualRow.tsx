import { useApp } from "../../state/AppState";
import { RITUAL_XP } from "../../data/plan";
import type { Day } from "../../types";

/* The morning ritual, dashed until it's done. Same toggle the dojo's log
   button drives — one piece of state, two places to press it. */

interface RitualRowProps {
  day: Day;
  done: boolean;
}

export default function RitualRow({ day, done }: RitualRowProps) {
  const { actions } = useApp();

  return (
    <button
      className={"ritual" + (done ? " done" : "")}
      onClick={() => actions.toggleRitual(day.id)}
      aria-pressed={done}
    >
      <span
        className="pcheck"
        style={done ? { background: day.color, borderColor: day.color, color: "#fff" } : undefined}
      >
        ✓
      </span>
      <span style={{ flex: 1, textAlign: "left" }}>{day.ritual}</span>
      <span className="xpv">{"+" + RITUAL_XP}</span>
    </button>
  );
}
