import Icon from "../shared/Icon";
import LinkButton from "../ui/LinkButton";
import type { Trouble } from "./lib/trouble";
import "./TroubleNotice.css";

interface Props {
  trouble: Trouble;
  onRetry: () => void;
  onNewChat: () => void;
}

export default function TroubleNotice({ trouble, onRetry, onNewChat }: Props) {
  return (
    <div className="asst-trouble" role="alert">
      <Icon name="alert-triangle" size={14} />
      <span>{trouble.text}</span>
      {trouble.kind === "other" && <LinkButton onClick={onRetry}>Retry</LinkButton>}
      {trouble.kind === "full" && <LinkButton onClick={onNewChat}>New chat</LinkButton>}
    </div>
  );
}
