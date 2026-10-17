import { Marked } from "marked";
import { escapeHtml } from "./escapeHtml";
import { highlightPython } from "./highlightPython";

/* No language, or any spelling of Python: the model's fences are nearly always Python here. */
const PYTHON = /^(py|python3?)?$/i;

/* Its own instance, because `Markdown` passes HTML through and this is model text: raw HTML is escaped, and images are refused because a markdown image is a request that can smuggle data out. */
const answers = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html: ({ text }) => escapeHtml(text),
    image: ({ text }) => escapeHtml(text),
    link({ href, tokens }) {
      const label = this.parser.parseInline(tokens);
      return /^https?:\/\//i.test(href)
        ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`
        : label;
    },
    code: ({ text, lang }) => {
      const body = PYTHON.test((lang ?? "").trim().split(/\s+/)[0] ?? "") ? highlightPython(text) : escapeHtml(text);
      return `<pre><code>${body}</code></pre>\n`;
    },
  },
});

export const renderAnswer = (markdown: string): string => answers.parse(markdown, { async: false });
