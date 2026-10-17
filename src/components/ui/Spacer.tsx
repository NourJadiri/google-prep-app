import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import "./Spacer.css";

export default function Spacer({ className, ...rest }: ComponentProps<"span">) {
  return <span className={cx("spacer", className)} {...rest} />;
}
