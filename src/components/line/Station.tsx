import type { CSSProperties, ReactNode } from "react";

/* One stop on the rail. Sets --seg to the day's phase colour; the rail
   segment, the dot, the progress bar and the ritual border all read it.
   Rendered as a direct child of .linewrap so the first/last rail trims land. */

/** React's CSSProperties has no slot for custom properties, and --seg is how
 *  four separate rules pick up the day's colour. Intersecting rather than
 *  casting keeps the value checked: --seg still has to be a string. */
type SegStyle = CSSProperties & { "--seg": string };

interface StationProps {
  color: string;
  done?: boolean;
  now?: boolean;
  open?: boolean;
  terminus?: boolean;
  /** What sits inside the dot — a tick on a cleared station, else nothing. */
  mark?: ReactNode;
  children?: ReactNode;
}

export default function Station({
  color,
  done,
  now,
  open,
  terminus,
  mark,
  children,
}: StationProps) {
  const cls = ["stn", done && "done", now && "now", open && "open", terminus && "terminus"]
    .filter(Boolean)
    .join(" ");
  const style: SegStyle = { "--seg": color };

  return (
    <div className={cls} style={style}>
      <div className="rail">
        <div className="stop">{mark}</div>
      </div>
      <div className="stn-body">{children}</div>
    </div>
  );
}
