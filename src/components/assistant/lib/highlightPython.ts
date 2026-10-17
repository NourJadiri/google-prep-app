import { highlightCode, tagHighlighter } from "@lezer/highlight";
import { pythonLanguage } from "@codemirror/lang-python";
import { highlightRules } from "../../../lib/highlightRules";
import { escapeHtml } from "./escapeHtml";

const classes = tagHighlighter(
  highlightRules.map(({ tag, kind, bold }) => ({ tag, class: bold ? `hl-${kind} hl-def` : `hl-${kind}` }))
);

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
