import type { Badge } from "../../../types";
import Icon from "../../shared/Icon";
import { BADGE_GLYPHS } from "./badgeGlyphs";
import "./BadgeTile.css";

interface BadgeTileProps {
  badge: Badge;
  color: string | undefined;
  earned: boolean;
}

export default function BadgeTile({ badge, color, earned }: BadgeTileProps) {
  return (
    <div className={"badge" + (earned ? "" : " locked")} title={badge.d}>
      <span className="ic" style={{ color }}>
        <Icon name={BADGE_GLYPHS[badge.id] ?? "star"} size={18} />
      </span>
      <span>{badge.n}</span>
    </div>
  );
}
