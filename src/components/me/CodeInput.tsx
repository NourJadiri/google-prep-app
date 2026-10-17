import type { ComponentProps } from "react";
import "./CodeInput.css";

export default function CodeInput(props: ComponentProps<"input">) {
  return <input className="syncinput" spellCheck={false} autoCapitalize="none" autoCorrect="off" {...props} />;
}
