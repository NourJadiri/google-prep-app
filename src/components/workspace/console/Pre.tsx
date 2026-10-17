import type { ComponentProps } from "react";
import { cx } from "../../../lib/cx";
import "./Pre.css";

interface PreProps extends ComponentProps<"pre"> {
  tone?: "bad" | "good" | "dim";
}

export default function Pre({ tone, className, ...rest }: PreProps) {
  return <pre className={cx("ws-pre", tone, className)} {...rest} />;
}
