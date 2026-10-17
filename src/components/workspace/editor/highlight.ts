import { HighlightStyle } from "@codemirror/language";
import { highlightRules } from "../../../lib/highlightRules";

export const highlight = HighlightStyle.define(
  highlightRules.map(({ tag, kind, italic, bold }) => ({
    tag,
    color: `var(--hl-${kind})`,
    ...(italic ? { fontStyle: "italic" } : {}),
    ...(bold ? { fontWeight: "600" } : {}),
  }))
);
