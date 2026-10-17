import type Anthropic from "@anthropic-ai/sdk";
import { MOODS, ONE_SHOT_MOOD, type Mood, type Persona } from "../../shared/assistantContract";

export const hasMoods = (persona: Persona): boolean => persona === "catgirl";

/** The faces on offer: the one-shot face only when the problem was one-shot, so it can't turn up any other time. */
export const moodsFor = (oneShot: boolean): readonly Mood[] => (oneShot ? [...MOODS, ONE_SHOT_MOOD] : MOODS);

/* Both required, mood first: required properties stream in schema order, so the face is known before the first word. */
export const moodFormat = (moods: readonly Mood[]): Anthropic.JSONOutputFormat => ({
  type: "json_schema",
  schema: {
    type: "object",
    properties: {
      mood: { type: "string", enum: [...moods] },
      answer: { type: "string" },
    },
    required: ["mood", "answer"],
    additionalProperties: false,
  },
});

const ESCAPES: Record<string, string> = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" };


/**
 * Reads `{"mood": "...", "answer": "..."}` as it streams in: the answer's characters come out as soon as
 * they are decoded, the mood once its string closes. A reply that isn't an object (a refusal is plain
 * text) passes through untouched.
 */
export class MoodedAnswer {
  private state: "start" | "raw" | "between" | "key" | "colon" | "value" | "string" | "escape" | "unicode" | "skip" = "start";
  private key = "";
  private value = "";
  private hex = "";
  private inKey = false;
  private high = "";

  constructor(private readonly moods: readonly Mood[]) {}

  /** Enum casing isn't guaranteed, and anything off the list is no mood at all. */
  private moodOf(raw: string): Mood | undefined {
    return this.moods.find((m) => m === raw.trim().toLowerCase());
  }

  /** Feed one text delta; get back the answer text it completed, and the mood if it just closed. */
  push(chunk: string): { text: string; mood?: Mood } {
    let text = "";
    let mood: Mood | undefined;
    const emit = (s: string) => {
      if (this.inKey) this.key += s;
      else if (this.key === "answer") text += s;
      else this.value += s;
    };
    const unit = (s: string) => {
      // A high surrogate waits for its pair, so no delta ever carries half a character.
      if (this.high) {
        emit(this.high + s);
        this.high = "";
      } else if (s.length === 1 && s >= "\ud800" && s <= "\udbff") this.high = s;
      else emit(s);
    };

    for (const ch of chunk) {
      switch (this.state) {
        case "start":
          if (/\s/.test(ch)) break;
          if (ch === "{") this.state = "between";
          else {
            this.state = "raw";
            text += ch;
          }
          break;
        case "raw":
          text += ch;
          break;
        case "between":
          if (ch === '"') {
            this.state = "key";
            this.inKey = true;
            this.key = "";
          }
          break;
        case "key":
          if (ch === "\\") this.state = "escape";
          else if (ch === '"') {
            this.inKey = false;
            this.state = "colon";
          } else this.key += ch;
          break;
        case "colon":
          if (ch === ":") this.state = "value";
          break;
        case "value":
          if (/\s/.test(ch)) break;
          if (ch === '"') {
            this.state = "string";
            this.value = "";
          } else this.state = "skip";
          break;
        case "skip":
          if (ch === "," || ch === "}") this.state = "between";
          break;
        case "string":
          if (ch === "\\") this.state = "escape";
          else if (ch === '"') {
            if (this.key === "mood") mood = this.moodOf(this.value) ?? mood;
            this.state = "between";
          } else unit(ch);
          break;
        case "escape":
          if (ch === "u") {
            this.state = "unicode";
            this.hex = "";
          } else {
            unit(ESCAPES[ch] ?? ch);
            this.state = this.inKey ? "key" : "string";
          }
          break;
        case "unicode":
          this.hex += ch;
          if (this.hex.length === 4) {
            unit(String.fromCharCode(parseInt(this.hex, 16)));
            this.state = this.inKey ? "key" : "string";
          }
          break;
      }
    }
    return mood ? { text, mood } : { text };
  }
}
