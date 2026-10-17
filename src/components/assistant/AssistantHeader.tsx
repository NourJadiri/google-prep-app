import Icon from "../shared/Icon";
import IconButton from "../ui/IconButton";
import Spacer from "../ui/Spacer";
import type { DragHandlers } from "./hooks/useFloatingBox";
import "./AssistantHeader.css";

interface Props {
  drag: DragHandlers;
  hasChat: boolean;
  unlocked: boolean;
  onNewChat: () => void;
  onForget: () => void;
  onClose: () => void;
}

export default function AssistantHeader({ drag, hasChat, unlocked, onNewChat, onForget, onClose }: Props) {
  return (
    <header className="asst-head" {...drag}>
      <Icon name="sparkles" size={15} className="asst-mark" />
      <h3>Assistant</h3>
      <Spacer />
      {hasChat && <IconButton size="sm" icon="rotate-ccw" label="New chat" title="New chat" onClick={onNewChat} />}
      {unlocked && <IconButton size="sm" icon="lock" label="Forget the password" title="Forget the password on this device" onClick={onForget} />}
      <IconButton size="sm" icon="x" iconSize={14} label="Close the assistant" title="Close (Esc)" onClick={onClose} />
    </header>
  );
}
