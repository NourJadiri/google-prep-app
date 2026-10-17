import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import "./StatusDot.css";

interface StatusDotProps extends ComponentProps<"i"> {
  tone: "ok" | "bad" | "warn" | "info" | "pulse";
}

export default function StatusDot({ tone, className, ...rest }: StatusDotProps) {
  return <i className={cx("ws-dot", tone, className)} {...rest} />;
}
