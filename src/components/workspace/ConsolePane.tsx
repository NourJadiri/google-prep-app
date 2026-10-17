import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Spec } from "../../data/problems";
import { caseFields, fieldNames } from "../../data/problems";
import type { CaseResult, RunOutcome, RunProgress } from "../../runner/types";
import { modKey } from "../../lib/platform";
import { caseMark, type Verdict } from "./verdict";
import Icon from "../shared/Icon";
import Badge from "../ui/Badge";
import LinkButton from "../ui/LinkButton";
import Spinner from "../ui/Spinner";
import StatusDot from "../ui/StatusDot";
import Tab from "../ui/Tab";
import Tabs from "../ui/Tabs";

/* The bottom of the right column: the cases you're about to run, and what
   happened when you ran them. LeetCode's two tabs, kept because the muscle
   memory is worth more than a redesign. */

/** A case in the Testcase tab. `origin` is the spec test it was copied from;
 *  untouched, it runs as that test (stored expected output and all), edited
 *  or added, it runs as a typed-in case answered by the reference. */
export interface CaseDraft {
  key: number;
  origin: number | null;
  fields: Record<string, string>;
}

export type PlanItem = { kind: "test"; test: number } | { kind: "case"; key: number };

export interface RunView {
  id: number;
  mode: "run" | "submit";
  /** What each harness case index was, in harness order. */
  plan: PlanItem[];
  progress: RunProgress | null;
  outcome: RunOutcome | null;
  verdict: Verdict | null;
}

export const isEdited = (spec: Spec, c: CaseDraft): boolean => {
  if (c.origin === null) return true;
  const t = spec.tests[c.origin];
  if (!t) return true;
  const orig = caseFields(spec, t);
  return Object.keys(orig).some((k) => (c.fields[k] ?? "").trim() !== (orig[k] ?? "").trim());
};

interface ConsoleProps {
  spec: Spec;
  cases: CaseDraft[];
  onCases: (cs: CaseDraft[]) => void;
  activeCase: number;
  onActiveCase: (i: number) => void;
  tab: "cases" | "result";
  onTab: (t: "cases" | "result") => void;
  run: RunView | null;
}

export default function ConsolePane({
  spec,
  cases,
  onCases,
  activeCase,
  onActiveCase,
  tab,
  onTab,
  run,
}: ConsoleProps) {
  const names = fieldNames(spec);
  const cur = cases[activeCase] ?? cases[0];

  const edit = (name: string, value: string) => {
    if (!cur) return;
    onCases(cases.map((c) => (c.key === cur.key ? { ...c, fields: { ...c.fields, [name]: value } } : c)));
  };
  const add = () => {
    const base = cur ?? cases[0];
    const key = Math.max(0, ...cases.map((c) => c.key)) + 1;
    const fields = base ? { ...base.fields } : Object.fromEntries(names.map((n) => [n, ""]));
    onCases([...cases, { key, origin: null, fields }]);
    onActiveCase(cases.length);
  };
  const remove = (i: number) => {
    const next = cases.filter((_, k) => k !== i);
    onCases(next);
    onActiveCase(Math.max(0, Math.min(activeCase, next.length - 1)));
  };
  const restore = () => {
    const shown = spec.tests.map((t, i) => ({ t, i })).filter(({ t }) => t.show);
    onCases(shown.map(({ t, i }, k) => ({ key: k + 1, origin: i, fields: caseFields(spec, t) })));
    onActiveCase(0);
  };

  const running = run !== null && run.outcome === null;
  const resultDot = running ? <StatusDot tone="pulse" aria-label="running" /> : run?.verdict && <StatusDot tone={run.verdict.tone} aria-hidden="true" />;

  return (
    <section className="ws-console" aria-label="Tests">
      <Tabs>
        <Tab icon="list-checks" selected={tab === "cases"} onSelect={() => onTab("cases")}>
          Testcase
        </Tab>
        <Tab icon="terminal" selected={tab === "result"} onSelect={() => onTab("result")} status={resultDot}>
          Result
        </Tab>
      </Tabs>

      <div className="ws-console-body">
        {tab === "cases" ? (
          <div className="ws-cases">
            <div className="ws-chips">
              {cases.map((c, i) => (
                <span key={c.key} className={"ws-chip" + (i === activeCase ? " on" : "")}>
                  <button onClick={() => onActiveCase(i)}>
                    {"Case " + (i + 1)}
                    {isEdited(spec, c) && c.origin !== null && <i className="ws-edited" title="Edited — the reference solution will answer it" />}
                  </button>
                  {cases.length > 1 && i === activeCase && (
                    <button className="ws-chip-x" onClick={() => remove(i)} aria-label={"Remove case " + (i + 1)}>
                      <Icon name="x" size={11} strokeWidth={2.5} />
                    </button>
                  )}
                </span>
              ))}
              <button className="ws-chip add" onClick={add} aria-label="Add a case" title="Add a case">
                <Icon name="plus" size={13} />
              </button>
              <LinkButton onClick={restore} title="Back to the problem's examples">
                Reset
              </LinkButton>
            </div>
            {cur && (
              <div className="ws-fields">
                {names.map((n) => (
                  <label key={n} className="ws-field">
                    <span>{n} =</span>
                    <textarea
                      value={cur.fields[n] ?? ""}
                      spellCheck={false}
                      rows={Math.min(6, Math.max(1, Math.ceil((cur.fields[n] ?? "").length / 64)))}
                      onChange={(e) => edit(n, e.target.value)}
                    />
                  </label>
                ))}
                <p className="ws-hint">
                  JSON or Python literals. Edited and added cases are answered by the reference solution.
                </p>
              </div>
            )}
          </div>
        ) : (
          <Results spec={spec} cases={cases} run={run} />
        )}
      </div>
    </section>
  );
}

/* ------------------------------- results ------------------------------- */

function Results({ spec, cases, run }: { spec: Spec; cases: CaseDraft[]; run: RunView | null }) {
  const [sel, setSel] = useState(0);
  const runId = run?.id ?? 0;
  const focus = run?.verdict?.focus ?? 0;
  /* Each finished run opens on the case worth looking at. */
  useEffect(() => setSel(focus), [runId, focus]);

  if (!run) {
    const mod = modKey();
    return (
      <div className="ws-empty">
        <p>
          <b>Run</b> tries the cases in the Testcase tab. <b>Submit</b> runs every test, hidden ones included,
          and a clean sweep ticks the problem.
        </p>
        <p className="ws-keys">
          <kbd>{mod}</kbd> <kbd>↵</kbd> run · <kbd>{mod}</kbd> <kbd>⇧</kbd> <kbd>↵</kbd> submit
        </p>
      </div>
    );
  }

  const o = run.outcome;
  if (!o) {
    const n = run.progress?.results.length ?? 0;
    return (
      <div className="ws-running">
        <Spinner />
        <p>{run.progress ? `Running ${run.mode === "submit" ? "test" : "case"} ${Math.min(n + 1, run.plan.length)} of ${run.plan.length}…` : "Starting Python…"}</p>
      </div>
    );
  }

  const v = run.verdict;
  const label = (r: CaseResult) => describe(spec, run, cases, r);
  const results = run.mode === "run" ? orderLikeCases(run, cases, o.results) : o.results;
  const chosen = results[sel] ?? results[0];

  return (
    <div className="ws-results">
      {v && (
        <div className={"ws-verdict " + v.tone}>
          <strong>{v.title}</strong>
          <span>{v.detail}</span>
        </div>
      )}

      {o.compileError && <ErrorBox err={o.compileError} />}
      {o.entryError && <p className="ws-note">{o.entryError}</p>}
      {o.stdout && (
        <Block title="Printed while loading">
          <pre className="ws-pre">{o.stdout}</pre>
        </Block>
      )}

      {results.length > 0 && (
        <div className={"ws-chips" + (run.mode === "submit" ? " grid" : "")} role="tablist" aria-label="Cases">
          {results.map((r, k) => {
            const m = caseMark(r.status);
            return (
              <button
                key={r.i}
                role="tab"
                aria-selected={k === sel}
                className={"ws-chip mark " + m.tone + (k === sel ? " on" : "")}
                onClick={() => setSel(k)}
                title={label(r) + " — " + m.word}
              >
                {run.mode === "submit" ? planTestNumber(run, r) : label(r)}
              </button>
            );
          })}
          {o.total > results.length && (
            <span className="ws-notrun">{o.total - results.length} not run</span>
          )}
        </div>
      )}

      {chosen && <CaseDetail spec={spec} r={chosen} title={label(chosen)} abortMsg={o.aborted?.at === chosen.i ? o.aborted.message : null} />}
    </div>
  );
}

/* Run-mode results arrive spec tests first, then typed-in ones (that's how
   the harness takes them); the chips should read in the Testcase tab's
   order instead. */
function orderLikeCases(run: RunView, cases: CaseDraft[], results: CaseResult[]): CaseResult[] {
  const byCase = (c: CaseDraft) =>
    results.find((r) => {
      const p = run.plan[r.i];
      return p !== undefined && (p.kind === "case" ? p.key === c.key : c.origin === p.test && p.kind === "test");
    });
  const ordered = cases.map(byCase).filter((r): r is CaseResult => !!r);
  return ordered.length === results.length ? ordered : results;
}

function planTestNumber(run: RunView, r: CaseResult): string {
  const p = run.plan[r.i];
  return p && p.kind === "test" ? String(p.test + 1) : String(r.i + 1);
}

function describe(spec: Spec, run: RunView, cases: CaseDraft[], r: CaseResult): string {
  const p = run.plan[r.i];
  if (!p) return "Case " + (r.i + 1);
  if (p.kind === "case") {
    const k = cases.findIndex((c) => c.key === p.key);
    return "Case " + (k + 1);
  }
  if (run.mode === "run") {
    const k = cases.findIndex((c) => c.origin === p.test);
    return "Case " + (k + 1);
  }
  const t = spec.tests[p.test];
  return "Test " + (p.test + 1) + (t?.label ? " · " + t.label : t?.show ? " · example" : "");
}

function CaseDetail({ spec, r, title, abortMsg }: { spec: Spec; r: CaseResult; title: string; abortMsg: string | null }) {
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
      {abortMsg && r.status !== "tle" && <p className="ws-note">{abortMsg}</p>}
      {r.status === "tle" && (
        <p className="ws-note">
          This case ran past its time limit. Pyodide is a few times slower than native Python, but the limit leaves
          room for the intended complexity — look for a nested loop or repeated work.
        </p>
      )}
      <Block title="Input">
        {r.input.length ? r.input.map((line, k) => <pre key={k} className="ws-pre">{line}</pre>) : <pre className="ws-pre dim">—</pre>}
      </Block>
      {r.got !== undefined && (
        <Block title="Output">
          <pre className={"ws-pre" + (mismatch ? " bad" : "")}>{r.got}</pre>
        </Block>
      )}
      {r.expected !== undefined && (
        <Block title="Expected">
          <pre className={"ws-pre" + (mismatch ? " good" : "")}>{r.expected}</pre>
        </Block>
      )}
      {r.refError && <p className="ws-note">{r.refError}</p>}
      {r.message && <p className="ws-note">{r.message}</p>}
      {r.error && <ErrorBox err={r.error} />}
      {r.stdout && (
        <Block title="Stdout">
          <pre className="ws-pre">{r.stdout}</pre>
        </Block>
      )}
      {spec.kind === "design" && r.status === "fail" && !r.message && (
        <p className="ws-note">Outputs line up one per operation: null for the constructor and for methods that return nothing.</p>
      )}
    </div>
  );
}

function ErrorBox({ err }: { err: NonNullable<CaseResult["error"]> }) {
  return (
    <div className="ws-error">
      <div className="ws-error-msg">
        <Icon name="alert-triangle" size={14} />
        {err.message}
        {err.line && <span className="ws-line">line {err.line}</span>}
      </div>
      {err.traceback && err.traceback !== err.message && <pre className="ws-pre">{err.traceback}</pre>}
      {err.hint && <p className="ws-hint">{err.hint}</p>}
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="ws-block">
      <div className="ws-block-title">{title}</div>
      {children}
    </div>
  );
}
