import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";

export default function ButtonRow({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cx("mrow", className)} {...rest} />;
}
