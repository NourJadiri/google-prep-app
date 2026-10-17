import type { Mood, Persona } from "../../../../shared/assistantContract";
import type { IconName } from "../../shared/Icon";
import angry from "../assets/bana/angry.webp";
import dizzy from "../assets/bana/dizzy.webp";
import elated from "../assets/bana/elated.webp";
import happy from "../assets/bana/happy.webp";
import neutral from "../assets/bana/neutral.webp";
import sad from "../assets/bana/sad.webp";
import shocked from "../assets/bana/shocked.webp";
import smug from "../assets/bana/smug.webp";

export interface PersonaLook {
  id: Persona;
  label: string;
  /** The toggle's icon, and the mark in the window's header. */
  icon: IconName;
  mark: IconName;
  tagline?: string;
  placeholder: string;
  intro: string;
  /** The greeting after a one-shot, in a mode with a face for it. */
  oneShotIntro?: string;
  /** A face for Bana: the window then reads like a messenger, her lines in bubbles beside it. */
  avatar?: string;
  /** The face each answer's mood shows; the avatar stands in until one is known. */
  faces?: Record<Mood, string>;
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
    placeholder: "Ask Mommy, kitten… 🐾",
    intro: "hii kitten :3 🐾 show Mommy your code and she'll tell you what you did wrong 😼 then how to make it right ✨ your last run comes along too. nya~ 🖤",
    oneShotIntro: "you ONE-SHOT it?? 🙀💦 first try, every test green ✅✅✅ Mommy is so proud of you, kitten 💜✨ ask me anything~ 🐾",
    avatar: neutral,
    faces: { happy, angry, sad, shocked, smug, dizzy, elated },
  },
];

export const lookOf = (persona: Persona): PersonaLook =>
  PERSONA_LOOKS.find((p) => p.id === persona) ?? (PERSONA_LOOKS[0] as PersonaLook);

export const faceOf = (look: PersonaLook, mood: Mood | undefined): string | undefined =>
  (mood && look.faces?.[mood]) || look.avatar;
