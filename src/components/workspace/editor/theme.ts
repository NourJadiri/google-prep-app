import { EditorView } from "@codemirror/view";

/* Everything reads the app's CSS variables, so light, dark and the accents need no branches here. */
export const theme = EditorView.theme({
  "&": { height: "100%", backgroundColor: "var(--ed-bg)", color: "var(--ink)" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { fontFamily: "var(--mono)", lineHeight: "1.62", overflow: "auto" },
  ".cm-content": { caretColor: "var(--ink)", padding: "10px 0 40px" },
  ".cm-line": { padding: "0 14px 0 6px" },
  ".cm-gutters": {
    backgroundColor: "var(--ed-gutter)",
    color: "var(--ink2)",
    border: "none",
    borderRight: "1px solid var(--line)",
  },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 12px", minWidth: "34px" },
  ".cm-activeLine": { backgroundColor: "var(--ed-active)" },
  ".cm-activeLineGutter": { backgroundColor: "var(--ed-active)", color: "var(--ink)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "var(--ed-sel) !important",
  },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--ink)", borderLeftWidth: "2px" },
  ".cm-errline": { backgroundColor: "var(--ed-err)" },
  ".cm-matchingBracket": {
    backgroundColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
    outline: "1px solid color-mix(in srgb, var(--accent) 45%, transparent)",
  },
  ".cm-selectionMatch": { backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)" },
  ".cm-foldPlaceholder": { backgroundColor: "var(--sunken)", border: "1px solid var(--line)", color: "var(--ink2)" },
  ".cm-tooltip": {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: "8px",
    boxShadow: "var(--shadow)",
    overflow: "hidden",
  },
  ".cm-tooltip-autocomplete > ul": { fontFamily: "var(--mono)", maxHeight: "16em" },
  ".cm-tooltip-autocomplete > ul > li": { padding: "2px 10px !important" },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
    backgroundColor: "color-mix(in srgb, var(--accent) 16%, transparent)",
    color: "var(--ink)",
  },
  ".cm-panels": { backgroundColor: "var(--surface)", color: "var(--ink)" },
  ".cm-panels.cm-panels-top": { borderBottom: "1px solid var(--line)" },
  ".cm-panel.cm-search input, .cm-panel.cm-search button": { fontFamily: "inherit", fontSize: "12px" },
  ".cm-searchMatch": { backgroundColor: "color-mix(in srgb, var(--yellow) 35%, transparent)" },
});

export const fontTheme = (px: number) => EditorView.theme({ "&": { fontSize: px + "px" } });
