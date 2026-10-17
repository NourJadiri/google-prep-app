import { cx } from "../../lib/cx";
import Icon, { type IconName } from "../shared/Icon";
import "./TabButton.css";

interface TabButtonProps {
  icon: IconName;
  label: string;
  current: boolean;
  onSelect: () => void;
}

export default function TabButton({ icon, label, current, onSelect }: TabButtonProps) {
  return (
    <button className={cx("tab", current && "on")} aria-current={current ? "page" : undefined} onClick={onSelect}>
      <span className="ic">
        <Icon name={icon} size={20} strokeWidth={1.8} />
      </span>
      {label}
    </button>
  );
}
