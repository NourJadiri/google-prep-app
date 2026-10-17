import type { ReactNode } from "react";
import Icon, { type IconName } from "../../shared/Icon";
import "./HintBox.css";

interface HintBoxProps {
  icon: IconName;
  title: string;
  children: ReactNode;
}

export default function HintBox({ icon, title, children }: HintBoxProps) {
  return (
    <details className="ws-hintbox">
      <summary>
        <Icon name={icon} size={14} />
        {title}
      </summary>
      {children}
    </details>
  );
}
