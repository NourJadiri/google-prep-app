import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import Icon, { type IconName } from "../shared/Icon";
import "./PillButton.css";

interface PillButtonProps extends ComponentProps<"button"> {
  tone?: "danger";
  /** A glyph in front of the label. */
  icon?: IconName;
}

export default function PillButton({ tone, icon, className, children, ...rest }: PillButtonProps) {
  return (
    <button className={cx("mbtn", tone, icon && "ico", className)} {...rest}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
}
