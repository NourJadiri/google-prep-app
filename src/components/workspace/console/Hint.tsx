import type { ComponentProps } from "react";
import "./Hint.css";

export default function Hint(props: ComponentProps<"p">) {
  return <p className="ws-hint" {...props} />;
}
