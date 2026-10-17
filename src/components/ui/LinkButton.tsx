import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import "./LinkButton.css";

export default function LinkButton({ className, ...rest }: ComponentProps<"button">) {
  return <button className={cx("ws-linkbtn", className)} {...rest} />;
}
