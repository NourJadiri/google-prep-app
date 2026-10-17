import { Fragment } from "react";
import "./CodeBlock.css";

interface CodeBlockProps {
  code: string;
  className?: string;
}

/** Monospace snippet; `____` marks the hole in a missing-line card and gets the amber highlight. */
export default function CodeBlock({ code, className = "code" }: CodeBlockProps) {
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
