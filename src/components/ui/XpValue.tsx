import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import "./XpValue.css";

export default function XpValue({ className, ...rest }: ComponentProps<"span">) {
  return <span className={cx("xpv", className)} {...rest} />;
}
