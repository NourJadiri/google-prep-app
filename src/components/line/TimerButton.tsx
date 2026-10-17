import type { ReactNode } from "react";
import Icon, { type IconName } from "../shared/Icon";
import "./TimerButton.css";

interface TimerButtonProps {
  icon: IconName;
  onClick: () => void;
  children: ReactNode;
}

export default function TimerButton({ icon, onClick, children }: TimerButtonProps) {
  return (
    <button className="tbtn" onClick={onClick}>
      <Icon name={icon} size={12} strokeWidth={2.5} />
      {children}
    </button>
  );
}
