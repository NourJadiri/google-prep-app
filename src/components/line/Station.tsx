import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../lib/cx";
import Icon from "../shared/Icon";
import "./Station.css";

/* --seg is the day's colour; the rail, dot, eyebrow, progress bar and ritual border all read it.
   Station must stay a direct child of .linewrap: the rail trims rely on :first-child / :last-child. */
type SegStyle = CSSProperties & { "--seg": string };

interface StationProps {
  color: string;
  done?: boolean;
  now?: boolean;
  open?: boolean;
  terminus?: boolean;
  children?: ReactNode;
}

export default function Station({ color, done, now, open, terminus, children }: StationProps) {
  const style: SegStyle = { "--seg": color };

  return (
    <div className={cx("stn", done && "done", now && "now", open && "open", terminus && "terminus")} style={style}>
      <div className="rail">
        <div className="stop">{done && <Icon name="check" size={12} strokeWidth={3.5} />}</div>
      </div>
      <div className="stn-body">{children}</div>
    </div>
  );
}
