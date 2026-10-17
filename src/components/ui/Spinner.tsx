import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import "./Spinner.css";

export default function Spinner({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cx("ws-spinner", className)} aria-hidden="true" {...rest} />;
}
