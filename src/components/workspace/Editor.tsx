import { useEffect, useRef } from "react";
import { Compartment, EditorState, Prec, StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  type DecorationSet,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import {
  HighlightStyle,
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { python } from "@codemirror/lang-python";
import { tags as t } from "@lezer/highlight";

/* CodeMirror 6, configured once and themed entirely from the app's tokens,
   so light and dark — and the Google and Local accents — need no branches
   here. React owns only what changes: which document is showing, the font
   size, and the line the last error pointed at. */

/* The red band on the line a traceback blamed. Cleared by the next edit,
   because by then it's pointing at a line that may not mean the same thing. */
const setErrorLine = StateEffect.define<number | null>();
const errorLine = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    for (const e of tr.effects) {
      if (e.is(setErrorLine)) {
        const n = e.value;
        if (n === null || n < 1 || n > tr.state.doc.lines) return Decoration.none;
        const line = tr.state.doc.line(n);
        return Decoration.set([Decoration.line({ class: "cm-errline" }).range(line.from)]);
      }
    }
    return tr.docChanged ? Decoration.none : deco.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

const highlight = HighlightStyle.define([
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

const theme = EditorView.theme({
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

const fontTheme = (px: number) => EditorView.theme({ "&": { fontSize: px + "px" } });

export interface EditorProps {
  /** The document to show. Replaced wholesale whenever `docKey` changes;
   *  otherwise the editor owns the text and reports edits via onChange. */
  value: string;
  docKey: string;
  onChange?: (code: string) => void;
  onRun?: () => void;
  onSubmit?: () => void;
  errorLine?: number | null;
  /** Bumped per run, so the same line blamed twice still re-marks it after
   *  an edit cleared the first mark. */
  errorRev?: number;
  fontSize: number;
  readOnly?: boolean;
  label: string;
}

export default function Editor({
  value,
  docKey,
  onChange,
  onRun,
  onSubmit,
  errorLine: errLine = null,
  errorRev = 0,
  fontSize,
  readOnly = false,
  label,
}: EditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const font = useRef(new Compartment());
  /* Callbacks through refs, so the extensions are built once per document
     and a parent re-render never rebuilds the editor. */
  const cbs = useRef({ onChange, onRun, onSubmit });
  cbs.current = { onChange, onRun, onSubmit };

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const state = EditorState.create({
      doc: value,
      extensions: [
        Prec.highest(
          keymap.of([
            { key: "Mod-Enter", run: () => (cbs.current.onRun?.(), true) },
            { key: "Shift-Mod-Enter", run: () => (cbs.current.onSubmit?.(), true) },
          ])
        ),
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        indentUnit.of("    "),
        EditorState.tabSize.of(4),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion({ activateOnTyping: true }),
        highlightActiveLine(),
        highlightSelectionMatches(),
        python(),
        syntaxHighlighting(highlight),
        theme,
        font.current.of(fontTheme(fontSize)),
        errorLine,
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          indentWithTab,
        ]),
        EditorView.contentAttributes.of({ "aria-label": label }),
        EditorState.readOnly.of(readOnly),
        EditorView.editable.of(!readOnly),
        /* A reference solution is read in a narrow pane: wrap it rather than
           hide the ends of its comments behind a scrollbar. */
        readOnly ? EditorView.lineWrapping : [],
        EditorView.updateListener.of((u) => {
          if (u.docChanged) cbs.current.onChange?.(u.state.doc.toString());
        }),
      ],
    });
    const v = new EditorView({ state, parent: el });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
    /* Keyed on the document, not the text: a new document is a new editor —
       fresh undo history, no stale error band — while typing never rebuilds. */
  }, [docKey, readOnly]);

  useEffect(() => {
    view.current?.dispatch({ effects: font.current.reconfigure(fontTheme(fontSize)) });
  }, [fontSize]);

  useEffect(() => {
    view.current?.dispatch({ effects: setErrorLine.of(errLine) });
  }, [errLine, errorRev, docKey]);

  return <div className="cm-host" ref={host} />;
}
