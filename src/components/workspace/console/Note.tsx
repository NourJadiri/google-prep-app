import type { ComponentProps } from "react";
import "./Note.css";

export default function Note(props: ComponentProps<"p">) {
  return <p className="ws-note" {...props} />;
}
