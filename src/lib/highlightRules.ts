import { tags as t, type Tag } from "@lezer/highlight";

type TokenKind = "kw" | "str" | "num" | "com" | "fn" | "cls" | "op" | "meta";

interface HighlightRule {
  tag: Tag | readonly Tag[];
  /** Picks the palette variable `--hl-<kind>` and the answer renderer's class `hl-<kind>`. */
  kind: TokenKind;
  italic?: boolean;
  /** A name being defined; answers class it `hl-def`. */
  bold?: boolean;
}

/** Which token kinds get which colours, for the editor's theme and the assistant's rendered code alike. */
export const highlightRules: readonly HighlightRule[] = [
  { tag: t.keyword, kind: "kw" },
  { tag: [t.string, t.special(t.string)], kind: "str" },
  { tag: [t.number, t.bool, t.null], kind: "num" },
  { tag: t.comment, kind: "com", italic: true },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], kind: "fn" },
  { tag: t.function(t.definition(t.variableName)), kind: "fn", bold: true },
  { tag: t.definition(t.className), kind: "cls", bold: true },
  { tag: [t.operator, t.compareOperator, t.arithmeticOperator], kind: "op" },
  { tag: t.meta, kind: "meta" },
  { tag: t.escape, kind: "num" },
];
