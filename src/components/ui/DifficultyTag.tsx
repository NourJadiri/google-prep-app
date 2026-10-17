import type { ComponentProps } from "react";
import { DIFFN } from "../../data/plan";
import { cx } from "../../lib/cx";
import type { Diff } from "../../types";
import "./DifficultyTag.css";

interface DifficultyTagProps extends Omit<ComponentProps<"span">, "children"> {
  diff: Diff;
}

export default function DifficultyTag({ diff, className, ...rest }: DifficultyTagProps) {
  return (
    <span className={cx("diff", diff, className)} {...rest}>
      {DIFFN[diff]}
    </span>
  );
}
