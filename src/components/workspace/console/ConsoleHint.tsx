import type { ComponentProps } from "react";
import "./ConsoleHint.css";

export default function ConsoleHint(props: ComponentProps<"p">) {
  return <p className="ws-console-hint" {...props} />;
}
