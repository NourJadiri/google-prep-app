import type { ComponentProps } from "react";
import { cx } from "../../../lib/cx";
import "./ValueBox.css";

interface ValueBoxProps extends ComponentProps<"pre"> {
  tone?: "bad" | "good" | "dim";
}

export default function ValueBox({ tone, className, ...rest }: ValueBoxProps) {
  return <pre className={cx("ws-value-box", tone, className)} {...rest} />;
}
