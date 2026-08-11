import { Fragment } from "react";

/* Monospace snippet. `____` marks the hole in a missing-line card and gets
   the amber highlight so the eye lands on it first. */

export default function CodeBlock({ code, className = "code" }) {
  const parts = String(code).split("____");
  return (
    <pre className={className}>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && <span className="blank">____</span>}
        </Fragment>
      ))}
    </pre>
  );
}
