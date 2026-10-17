import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import "./Tabs.css";

export default function Tabs({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cx("ws-tabs", className)} role="tablist" {...rest} />;
}
