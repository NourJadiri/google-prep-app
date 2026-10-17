import type { Persona } from "../../../../shared/assistantContract";
import type { IconName } from "../../shared/Icon";

export interface PersonaLook {
  id: Persona;
  label: string;
  /** The toggle's icon, and the mark in the window's header. */
  icon: IconName;
  mark: IconName;
  tagline?: string;
  placeholder: string;
  intro: string;
}

export const PERSONA_LOOKS: PersonaLook[] = [
  {
    id: "normal",
    label: "Normal",
    icon: "message-circle",
    mark: "smile",
    placeholder: "Ask about this problem…",
    intro: "Ask about syntax, your approach or a bug. Each question takes the problem, your code and your last run along.",
  },
  {
    id: "tough",
    label: "Tough love",
    icon: "flame",
    mark: "flame",
    tagline: "no excuses",
    placeholder: "Spit it out. What did you break?",
    intro: "Show me the mess. I'll tell you exactly how bad it is, then exactly how to fix it. Your code and your last run come along, so don't bother hiding them.",
  },
  {
    id: "catgirl",
    label: "Goth catgirl",
    icon: "cat",
    mark: "cat",
    tagline: "nya~",
    placeholder: "Ask Mommy, kitten…",
    intro: "Come here, kitten. Show Mommy your code and she'll tell you what you did wrong, then how to make it right. Your last run comes along too. Nya.",
  },
];

export const lookOf = (persona: Persona): PersonaLook =>
  PERSONA_LOOKS.find((p) => p.id === persona) ?? (PERSONA_LOOKS[0] as PersonaLook);
