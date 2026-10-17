import type { Persona } from "../../../shared/assistantContract";
import Icon from "../shared/Icon";
import IconButton from "../ui/IconButton";
import Spacer from "../ui/Spacer";
import type { DragHandlers } from "./hooks/useFloatingBox";
import PersonaToggle from "./PersonaToggle";
import "./AssistantHeader.css";

interface Props {
  drag: DragHandlers;
  hasChat: boolean;
  persona: Persona;
  onPersona: (persona: Persona) => void;
  unlocked: boolean;
  onNewChat: () => void;
  onForget: () => void;
  onClose: () => void;
}

export default function AssistantHeader({ drag, hasChat, persona, onPersona, unlocked, onNewChat, onForget, onClose }: Props) {
  return (
    <header className="asst-head" {...drag}>
      <Icon name="smile" size={15} className="asst-mark" />
      <h3>Patrick</h3>
      <PersonaToggle value={persona} onChange={onPersona} />
      <Spacer />
      {hasChat && <IconButton size="sm" icon="rotate-ccw" label="New chat" title="New chat" onClick={onNewChat} />}
      {unlocked && <IconButton size="sm" icon="lock" label="Forget the password" title="Forget the password on this device" onClick={onForget} />}
      <IconButton size="sm" icon="x" iconSize={14} label="Close Patrick" title="Close (Esc)" onClick={onClose} />
    </header>
  );
}
