import { RANKS } from "../../data/meta";
import { rankIdx } from "../../lib/engine";

/* Wanderer to Noogler, with a marker on where you actually are. */

export default function RankLadder({ xp }: { xp: number }) {
  const here = rankIdx(xp);

  return (
    <ul className="ladder">
      {RANKS.map(([name, need], k) => (
        <li key={name} className={k < here ? "past" : k === here ? "cur" : ""}>
          {(k < here ? "✓ " : k === here ? "→ " : "· ") + name}
          <span className="lxp">{need + " XP"}</span>
        </li>
      ))}
    </ul>
  );
}
