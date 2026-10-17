import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView, type DecorationSet } from "@codemirror/view";

export const setErrorLine = StateEffect.define<number | null>();

/* The red band on the line a traceback blamed. Any edit clears it: by then the line may not mean the same thing. */
export const errorLine = StateField.define<DecorationSet>({
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
