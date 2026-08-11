import { RANKCOL, RANKS } from "../../data/meta";
import { rankIdx } from "../../lib/engine";
import Icon from "../shared/Icon";

/* Wanderer to Noogler, with a marker on where you actually are. */

export default function RankLadder({ xp }: { xp: number }) {
  const here = rankIdx(xp);

  return (
    <ul className="ladder">
      {RANKS.map(([name, need], k) => (
        <li key={name} className={k < here ? "past" : k === here ? "cur" : ""}>
          <span className="lmark">
            {k < here ? (
              <Icon name="check" size={13} strokeWidth={2.5} />
            ) : (
              <i
                className={"ldot" + (k === here ? "" : " dim")}
                style={k === here ? { color: RANKCOL[k] } : undefined}
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
