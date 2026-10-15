/* The assistant's answers, as HTML.
 *
 * Md (Markdown.tsx) passes marked's HTML through on purpose: its input is
 * the bundled problem bank. An answer is text a model wrote, so it gets its
 * own marked instance that never lets markup through. Raw HTML shows as
 * text, images never load (a markdown image is a request to whatever URL
 * the text names, which is how data gets smuggled out), and links open only
 * to http(s), in a new tab, without a referrer.
 *
 * Python fences are coloured like the editor: lezer already parses Python
 * for CodeMirror, and assistant.css paints these classes with the same
 * --hl-* tokens as the editor's HighlightStyle. */

import { Marked } from "marked";
import { highlightCode, tagHighlighter, tags as t } from "@lezer/highlight";
import { pythonLanguage } from "@codemirror/lang-python";

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escape = (s: string): string => s.replace(/[&<>"']/g, (c) => ESC[c] ?? c);

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
      out += cls ? `<span class="${cls}">${escape(text)}</span>` : escape(text);
    },
    () => {
      out += "\n";
    }
  );
  return out;
}

/* No language, or any spelling of Python: the model's fences are nearly
   always Python here. Anything else stays plain. */
const PYTHON = /^(py|python3?)?$/i;

const answers = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html: ({ text }) => escape(text),
    image: ({ text }) => escape(text),
    link({ href, tokens }) {
      const label = this.parser.parseInline(tokens);
      return /^https?:\/\//i.test(href)
        ? `<a href="${escape(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`
        : label;
    },
    code: ({ text, lang }) => {
      const body = PYTHON.test((lang ?? "").trim().split(/\s+/)[0] ?? "") ? highlightPython(text) : escape(text);
      return `<pre><code>${body}</code></pre>\n`;
    },
  },
});

export const renderAnswer = (markdown: string): string => answers.parse(markdown, { async: false });
