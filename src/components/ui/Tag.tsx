import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import "./Tag.css";

interface TagProps extends ComponentProps<"span"> {
  tone?: "passed";
}

export default function Tag({ tone, className, ...rest }: TagProps) {
  return <span className={cx("tag", tone, className)} {...rest} />;
}
