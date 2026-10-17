import Icon from "../shared/Icon";
import "./DayHead.css";

interface DayHeadProps {
  eyebrow: string;
  title: string;
  open: boolean;
  onToggle: () => void;
}

export default function DayHead({ eyebrow, title, open, onToggle }: DayHeadProps) {
  return (
    <button className="dayhead" onClick={onToggle} aria-expanded={open}>
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
      </div>
      <span className="chev">
        <Icon name="chevron-down" size={18} />
      </span>
    </button>
  );
}
