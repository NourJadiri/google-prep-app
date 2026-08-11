import { useApp } from "../../state/AppState.jsx";

/* The same toggle as the Line's ritual row — one piece of state, two doors. */

export default function RitualLog({ day, logged }) {
  const { actions } = useApp();

  return (
    <div className={"dojo-log" + (logged ? " logged" : "")}>
      <p>
        <b>{"Day " + day.d + " ritual:"}</b> {day.ritual}
      </p>
      <button onClick={() => actions.toggleRitual(day.id)} aria-pressed={logged}>
        {logged ? "Logged ✓" : "Done · +15 XP"}
      </button>
    </div>
  );
}
