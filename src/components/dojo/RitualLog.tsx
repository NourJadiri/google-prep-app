import { RITUAL_XP } from "../../data/plan";
import { cx } from "../../lib/cx";
import type { Day } from "../../types";
import Icon from "../shared/Icon";
import "./RitualLog.css";

interface RitualLogProps {
  day: Day;
  ritual: string;
  logged: boolean;
  onToggle: (dayId: string) => void;
}

/* Same toggle as the Line's ritual row: one piece of state, two doors. */
export default function RitualLog({ day, ritual, logged, onToggle }: RitualLogProps) {
  return (
    <div className={cx("dojo-log", logged && "logged")}>
      {/* One text node after the <b>, not two: a split shifts glyph antialiasing by a subpixel. */}
      <p>
        <b>{"Day " + day.d + " ritual:"}</b>
        {" " + ritual}
      </p>
      <button onClick={() => onToggle(day.id)} aria-pressed={logged}>
        {logged ? (
          <>
            Logged
            <Icon name="check" size={13} strokeWidth={2.5} />
          </>
        ) : (
          <>
            Done
            <i className="bdot" />
            {"+" + RITUAL_XP + " XP"}
          </>
        )}
      </button>
    </div>
  );
}
