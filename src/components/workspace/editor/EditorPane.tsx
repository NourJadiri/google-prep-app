import { errorLineOf, type RunView } from "../lib/runPlan";
import Editor from "./Editor";
import EditorToolbar from "./EditorToolbar";
import "./EditorPane.css";

interface EditorPaneProps {
  title: string;
  code: string;
  docKey: string;
  onChange: (code: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  /** The last run, for the line it blamed. */
  run: RunView | null;
  fontSize: number;
  onFontStep: (delta: number) => void;
  onReset: () => void;
}

export default function EditorPane({ title, code, docKey, onChange, onRun, onSubmit, run, fontSize, onFontStep, onReset }: EditorPaneProps) {
  return (
    <section className="ws-code" aria-label="Code">
      <EditorToolbar fontSize={fontSize} onFontStep={onFontStep} onReset={onReset} />
      <div className="ws-editor">
        <Editor
          value={code}
          docKey={docKey}
          onChange={onChange}
          onRun={onRun}
          onSubmit={onSubmit}
          errorLine={errorLineOf(run)}
          errorRev={run?.id ?? 0}
          fontSize={fontSize}
          label={"Your solution to " + title}
        />
      </div>
    </section>
  );
}
