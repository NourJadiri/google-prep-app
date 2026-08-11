/* One stop on the rail. Sets --seg to the day's phase colour; the rail
   segment, the dot, the progress bar and the ritual border all read it.
   Rendered as a direct child of .linewrap so the first/last rail trims land. */

export default function Station({ color, done, now, open, terminus, mark, children }) {
  const cls = ["stn", done && "done", now && "now", open && "open", terminus && "terminus"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} style={{ "--seg": color }}>
      <div className="rail">
        <div className="stop">{mark}</div>
      </div>
      <div className="stn-body">{children}</div>
    </div>
  );
}
