import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import "./Badge.css";

interface BadgeProps extends ComponentProps<"span"> {
  tone?: "ok" | "bad" | "warn" | "info" | "idle";
}

export default function Badge({ tone, className, ...rest }: BadgeProps) {
  return <span className={cx("statusbadge", tone, className)} {...rest} />;
}
