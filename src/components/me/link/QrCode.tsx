import { useMemo } from "react";
import { qrMatrix } from "./lib/qrMatrix";

const QUIET = 4;

/* Drawn as one path of 1x1 squares rather than a rect per module: a version 5 symbol is ~600 dark modules, a real cost on a phone.
   Deliberately not themed: a scanner wants dark on light with a light margin, so these two hex values are the one place in the app that ignores the tokens.
   Nothing but the code is drawn here; framing, padding and size are the caller's CSS. */
export default function QrCode({ value, label }: { value: string; label: string }) {
  const matrix = useMemo(() => qrMatrix(value), [value]);
  /* Too long to encode. The caller always shows the link as text as well. */
  if (matrix === null) return null;

  const span = matrix.length + QUIET * 2;
  const squares: string[] = [];
  matrix.forEach((row, r) =>
    row.forEach((dark, c) => {
      if (dark) squares.push(`M${c + QUIET} ${r + QUIET}h1v1h-1z`);
    })
  );

  return (
    <svg
      viewBox={`0 0 ${span} ${span}`}
      width="100%"
      height="100%"
      shapeRendering="crispEdges"
      role="img"
      aria-label={label}
    >
      <rect width={span} height={span} fill="#ffffff" />
      <path d={squares.join("")} fill="#202124" />
    </svg>
  );
}
