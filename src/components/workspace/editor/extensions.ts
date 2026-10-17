import type { RefObject } from "react";
import { EditorState, Prec, type Compartment, type Extension } from "@codemirror/state";
import {
  EditorView,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { python } from "@codemirror/lang-python";
import { errorLine } from "./errorLine";
import { highlight } from "./highlight";
import { fontTheme, theme } from "./theme";

export interface EditorCallbacks {
  onChange?: (code: string) => void;
  onRun?: () => void;
  onSubmit?: () => void;
}

interface ExtensionOptions {
  /** Read through the ref at call time, so a parent re-render never rebuilds the editor. */
  callbacks: RefObject<EditorCallbacks>;
  font: Compartment;
  fontSize: number;
  label: string;
  readOnly: boolean;
}

export function editorExtensions({ callbacks, font, fontSize, label, readOnly }: ExtensionOptions): Extension[] {
  return [
    Prec.highest(
      keymap.of([
        { key: "Mod-Enter", run: () => (callbacks.current.onRun?.(), true) },
        { key: "Shift-Mod-Enter", run: () => (callbacks.current.onSubmit?.(), true) },
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
    font.of(fontTheme(fontSize)),
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
    /* A reference solution is read in a narrow pane: wrap it rather than hide the ends of its comments. */
    readOnly ? EditorView.lineWrapping : [],
    EditorView.updateListener.of((u) => {
      if (u.docChanged) callbacks.current.onChange?.(u.state.doc.toString());
    }),
  ];
}
