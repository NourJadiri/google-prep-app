import type { Persona } from "../../../../shared/assistantContract";
import type { IconName } from "../../shared/Icon";

export interface PersonaLook {
  id: Persona;
  label: string;
  icon: IconName;
}

export const PERSONA_LOOKS: PersonaLook[] = [
  { id: "normal", label: "Normal", icon: "message-circle" },
  { id: "tough", label: "Tough love", icon: "flame" },
  { id: "catgirl", label: "Goth catgirl", icon: "cat" },
];
