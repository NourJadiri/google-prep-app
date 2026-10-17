import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import "./RunCard.css";

/** The card a run's screens sit in: a question, then the result. */
export default function RunCard({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cx("qwrap", className)} {...rest} />;
}
