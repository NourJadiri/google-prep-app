import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import Icon, { type IconName } from "../shared/Icon";
import "./IconButton.css";

interface IconButtonProps extends Omit<ComponentProps<"button">, "children" | "aria-label"> {
  icon: IconName;
  label: string;
  size?: "sm";
  iconSize?: number;
}

export default function IconButton({ icon, label, size, iconSize = size === "sm" ? 13 : 18, className, ...rest }: IconButtonProps) {
  return (
    <button className={cx("iconbtn", size, className)} aria-label={label} {...rest}>
      <Icon name={icon} size={iconSize} />
    </button>
  );
}
