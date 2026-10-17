import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../lib/cx";
import Icon, { type IconName } from "../shared/Icon";

interface TabProps extends Omit<ComponentProps<"button">, "onClick" | "onSelect"> {
  selected: boolean;
  onSelect: () => void;
  icon?: IconName;
  status?: ReactNode;
}

export default function Tab({ selected, onSelect, icon, status, className, children, ...rest }: TabProps) {
  return (
    <button role="tab" aria-selected={selected} className={cx(selected && "on", className)} onClick={onSelect} {...rest}>
      {icon && <Icon name={icon} size={14} />}
      {children}
      {status}
    </button>
  );
}
