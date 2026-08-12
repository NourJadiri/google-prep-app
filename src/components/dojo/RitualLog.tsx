import { useApp } from "../../state/AppState";
import Icon from "../shared/Icon";
import type { Day } from "../../types";

/* The same toggle as the Line's ritual row — one piece of state, two doors. */

interface RitualLogProps {
  day: Day;
  logged: boolean;
}

export default function RitualLog({ day, logged }: RitualLogProps) {
  const { actions } = useApp();

  return (
    <div className={"dojo-log" + (logged ? " logged" : "")}>
      {/* One text node after the <b>, not two — a split here shifts glyph
          antialiasing by a subpixel against the reference. */}
      <p>
        <b>{"Day " + day.d + " ritual:"}</b>
        {" " + day.ritual}
      </p>
      <button onClick={() => actions.toggleRitual(day.id)} aria-pressed={logged}>
        {logged ? (
          <>
            Logged
            <Icon name="check" size={13} strokeWidth={2.5} />
          </>
        ) : (
          <>
            Done
            <i className="bdot" />
            +15 XP
          </>
        )}
      </button>
    </div>
  );
}
