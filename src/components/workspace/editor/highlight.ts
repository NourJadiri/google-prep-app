import { HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

export const highlight = HighlightStyle.define([
  { tag: t.keyword, color: "var(--hl-kw)" },
  { tag: [t.string, t.special(t.string)], color: "var(--hl-str)" },
  { tag: [t.number, t.bool, t.null], color: "var(--hl-num)" },
  { tag: t.comment, color: "var(--hl-com)", fontStyle: "italic" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "var(--hl-fn)" },
  { tag: t.function(t.definition(t.variableName)), color: "var(--hl-fn)", fontWeight: "600" },
  { tag: t.definition(t.className), color: "var(--hl-cls)", fontWeight: "600" },
  { tag: [t.operator, t.compareOperator, t.arithmeticOperator], color: "var(--hl-op)" },
  { tag: t.meta, color: "var(--hl-meta)" },
  { tag: t.escape, color: "var(--hl-num)" },
]);
