import type { Spec } from "../../../data/problems";
import type { CaseResult } from "../../../runner/types";
import { caseMark } from "../lib/verdict";
import Badge from "../../ui/Badge";
import Block from "./Block";
import ErrorBox from "./ErrorBox";
import Note from "./Note";
import Pre from "./Pre";
import "./CaseDetail.css";

interface CaseDetailProps {
  spec: Spec;
  result: CaseResult;
  title: string;
  abortMsg: string | null;
}

export default function CaseDetail({ spec, result: r, title, abortMsg }: CaseDetailProps) {
  const m = caseMark(r.status);
  const mismatch = r.status === "fail";
  return (
    <div className="ws-detail">
      <div className="ws-detail-head">
        <Badge tone={m.tone}>{m.word}</Badge>
        <span className="ws-detail-title">{title}</span>
        {r.perf && <span className="tag">large input</span>}
        {r.ms > 0 && <span className="ws-ms">{r.ms < 1 ? "<1" : Math.round(r.ms)} ms</span>}
      </div>
      {abortMsg && r.status !== "tle" && <Note>{abortMsg}</Note>}
      {r.status === "tle" && (
        <Note>
          This case ran past its time limit. Pyodide is a few times slower than native Python, but the limit leaves
          room for the intended complexity — look for a nested loop or repeated work.
        </Note>
      )}
      <Block title="Input">
        {r.input.length ? r.input.map((line, k) => <Pre key={k}>{line}</Pre>) : <Pre tone="dim">—</Pre>}
      </Block>
      {r.got !== undefined && (
        <Block title="Output">
          <Pre tone={mismatch ? "bad" : undefined}>{r.got}</Pre>
        </Block>
      )}
      {r.expected !== undefined && (
        <Block title="Expected">
          <Pre tone={mismatch ? "good" : undefined}>{r.expected}</Pre>
        </Block>
      )}
      {r.refError && <Note>{r.refError}</Note>}
      {r.message && <Note>{r.message}</Note>}
      {r.error && <ErrorBox err={r.error} />}
      {r.stdout && (
        <Block title="Stdout">
          <Pre>{r.stdout}</Pre>
        </Block>
      )}
      {spec.kind === "design" && r.status === "fail" && !r.message && (
        <Note>Outputs line up one per operation: null for the constructor and for methods that return nothing.</Note>
      )}
    </div>
  );
}
