import { highlightCode, tagHighlighter, tags as t } from "@lezer/highlight";
import { pythonLanguage } from "@codemirror/lang-python";
import { escapeHtml } from "./escapeHtml";

const classes = tagHighlighter([
  { tag: t.keyword, class: "hl-kw" },
  { tag: [t.string, t.special(t.string)], class: "hl-str" },
  { tag: [t.number, t.bool, t.null], class: "hl-num" },
  { tag: t.comment, class: "hl-com" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], class: "hl-fn" },
  { tag: t.function(t.definition(t.variableName)), class: "hl-fn hl-def" },
  { tag: t.definition(t.className), class: "hl-cls hl-def" },
  { tag: [t.operator, t.compareOperator, t.arithmeticOperator], class: "hl-op" },
  { tag: t.meta, class: "hl-meta" },
  { tag: t.escape, class: "hl-num" },
]);

export function highlightPython(code: string): string {
  let out = "";
  highlightCode(
    code,
    pythonLanguage.parser.parse(code),
    classes,
    (text, cls) => {
      out += cls ? `<span class="${cls}">${escapeHtml(text)}</span>` : escapeHtml(text);
    },
    () => {
      out += "\n";
    }
  );
  return out;
}
