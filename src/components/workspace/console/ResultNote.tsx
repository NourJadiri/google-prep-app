import type { ComponentProps } from "react";
import "./ResultNote.css";

export default function ResultNote(props: ComponentProps<"p">) {
  return <p className="ws-result-note" {...props} />;
}
