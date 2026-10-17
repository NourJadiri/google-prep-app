import type { Spec } from "../../../data/problems";
import type { CaseResult } from "../../../runner/types";
import { caseMark } from "../lib/verdict";
import Badge from "../../ui/Badge";
import Tag from "../../ui/Tag";
import Block from "./Block";
import ErrorBox from "./ErrorBox";
import ResultNote from "./ResultNote";
import ValueBox from "./ValueBox";
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
        {r.perf && <Tag>large input</Tag>}
        {r.ms > 0 && <span className="ws-ms">{r.ms < 1 ? "<1" : Math.round(r.ms)} ms</span>}
      </div>
      {abortMsg && r.status !== "tle" && <ResultNote>{abortMsg}</ResultNote>}
      {r.status === "tle" && (
        <ResultNote>
          This case ran past its time limit. Pyodide is a few times slower than native Python, but the limit leaves
          room for the intended complexity — look for a nested loop or repeated work.
        </ResultNote>
      )}
      <Block title="Input">
        {r.input.length ? r.input.map((line, k) => <ValueBox key={k}>{line}</ValueBox>) : <ValueBox tone="dim">—</ValueBox>}
      </Block>
      {r.got !== undefined && (
        <Block title="Output">
          <ValueBox tone={mismatch ? "bad" : undefined}>{r.got}</ValueBox>
        </Block>
      )}
      {r.expected !== undefined && (
        <Block title="Expected">
          <ValueBox tone={mismatch ? "good" : undefined}>{r.expected}</ValueBox>
        </Block>
      )}
      {r.refError && <ResultNote>{r.refError}</ResultNote>}
      {r.message && <ResultNote>{r.message}</ResultNote>}
      {r.error && <ErrorBox err={r.error} />}
      {r.stdout && (
        <Block title="Stdout">
          <ValueBox>{r.stdout}</ValueBox>
        </Block>
      )}
      {spec.kind === "design" && r.status === "fail" && !r.message && (
        <ResultNote>Outputs line up one per operation: null for the constructor and for methods that return nothing.</ResultNote>
      )}
    </div>
  );
}
