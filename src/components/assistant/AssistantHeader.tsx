import type { Mood, Persona } from "../../../shared/assistantContract";
import Icon from "../shared/Icon";
import IconButton from "../ui/IconButton";
import Spacer from "../ui/Spacer";
import type { DragHandlers } from "./hooks/useFloatingBox";
import { faceOf, lookOf } from "./lib/personas";
import Avatar from "./Avatar";
import PersonaToggle from "./PersonaToggle";
import "./AssistantHeader.css";

interface Props {
  drag: DragHandlers;
  hasChat: boolean;
  persona: Persona;
  /** Her latest answer's mood: the header wears that face. */
  mood?: Mood;
  onPersona: (persona: Persona) => void;
  unlocked: boolean;
  onNewChat: () => void;
  onForget: () => void;
  onClose: () => void;
}

export default function AssistantHeader({ drag, hasChat, persona, mood, onPersona, unlocked, onNewChat, onForget, onClose }: Props) {
  const look = lookOf(persona);
  const face = look.avatar && faceOf(look, mood);
  return (
    <header className="asst-head" {...drag}>
      {face ? <Avatar src={face} small mood={mood} /> : <Icon name={look.mark} size={15} className="asst-mark" />}
      <h3>Bana</h3>
      {look.tagline && <span className="asst-tagline">{look.tagline}</span>}
      <PersonaToggle value={persona} onChange={onPersona} />
      <Spacer />
      {hasChat && <IconButton size="sm" icon="rotate-ccw" label="New chat" title="New chat" onClick={onNewChat} />}
      {unlocked && <IconButton size="sm" icon="lock" label="Forget the password" title="Forget the password on this device" onClick={onForget} />}
      <IconButton size="sm" icon="x" iconSize={14} label="Close Bana" title="Close (Esc)" onClick={onClose} />
    </header>
  );
}
