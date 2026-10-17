import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import "./Note.css";

interface NoteProps extends ComponentProps<"p"> {
  tone?: "warn";
}

export default function Note({ tone, className, ...rest }: NoteProps) {
  return <p className={cx("storenote", tone, className)} {...rest} />;
}
