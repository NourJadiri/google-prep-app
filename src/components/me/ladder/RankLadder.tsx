import { rankIdx } from "../../../lib/engine";
import type { NonEmpty, Rank } from "../../../types";
import Icon from "../../shared/Icon";
import "./RankLadder.css";

interface RankLadderProps {
  ranks: NonEmpty<Rank>;
  colors: readonly string[];
  xp: number;
}

/** The line's ladder, with a marker on where you actually are. */
export default function RankLadder({ ranks, colors, xp }: RankLadderProps) {
  const here = rankIdx(ranks, xp);

  return (
    <ul className="ladder">
      {ranks.map(([name, need], k) => (
        <li key={name} className={k < here ? "past" : k === here ? "cur" : ""}>
          <span className="lmark">
            {k < here ? (
              <Icon name="check" size={13} strokeWidth={2.5} />
            ) : (
              <i
                className={"ldot" + (k === here ? "" : " dim")}
                style={k === here ? { color: colors[k] } : undefined}
              />
            )}
          </span>
          {name}
          <span className="lxp">{need + " XP"}</span>
        </li>
      ))}
    </ul>
  );
}
