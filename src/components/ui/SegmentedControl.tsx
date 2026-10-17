import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import "./SegmentedControl.css";

export default function SegmentedControl({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cx("seg", className)} role="tablist" {...rest} />;
}
