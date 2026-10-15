import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../../state/AppState";
import { DIFFN, LC } from "../../data/plan";
import { PROB_INDEX, TRACKS, specOf, type ProblemRef } from "../../data/tracks";
import { caseFields, hasProblem, loadProblem, type ProblemContent, type Spec } from "../../data/problems";
import { clearDraft, loadDraft, loadPrefs, saveDraft, savePrefs } from "../../lib/drafts";
import * as runner from "../../runner/runner";
import type { RunRequest } from "../../runner/types";
import Editor from "./Editor";
import Split from "./Split";
import Stopwatch from "./Stopwatch";
import ProblemPane from "./ProblemPane";
import ConsolePane, { isEdited, type CaseDraft, type PlanItem, type RunView } from "./ConsolePane";
import { verdictOf } from "./verdict";
import { claudePrompt, runReport } from "./claude";
import { withoutLead } from "./Markdown";
import type { AskContext } from "./Assistant";
import { useRunnerStatus } from "./useRunner";
import Icon from "../shared/Icon";
import "./workspace.css";

/* The assistant and the AI SDK behind it load on the first ⌘K, not before. */
const Assistant = lazy(() => import("./Assistant"));

/* The workspace: a problem, an editor, and the tests, over everything else.
 *
 * Full screen at any width. From 900px up it is LeetCode's three panes —
 * statement left, editor over console right, both splits draggable and
 * remembered; below that it is one pane at a time behind a segmented
 * control, which is enough to read on a phone and to type in a pinch.
 *
 * Code is saved per problem as you type (lib/drafts), tests run in the
 * Pyodide worker (runner/), and a Submit where every test passes ticks the
 * problem through the same rule as the check circle — XP, station clears
 * and all — plus the editor badges. ⌘K (Ctrl+K) floats the assistant over
 * all of it: a small chat that sees the problem, the code and the last run.
 */

export default function Workspace({ pid }: { pid: string }) {
  const { actions } = useApp();
  const ref = PROB_INDEX[pid];
  const specId = ref ? specOf(ref.prob) : null;
  const [content, setContent] = useState<ProblemContent | null | undefined>(undefined);
  const dialog = useRef<HTMLDivElement>(null);

  /* Focus moves into the dialog on open and back to whatever opened it on
     close — the row's editor button, for a keyboard user. */
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.current?.focus();
    return () => opener?.focus();
  }, []);

  useEffect(() => {
    let live = true;
    setContent(undefined);
    if (!hasProblem(specId)) {
      setContent(null);
      return;
    }
    void runner.warm().catch(() => {});
    void loadProblem(specId).then((c) => {
      if (live) setContent(c);
    });
    return () => {
      live = false;
    };
  }, [specId]);

  /* An id no line carries (only reachable from a stale session) closes the
     workspace rather than rendering an empty shell. */
  useEffect(() => {
    if (!ref) actions.closeWork();
  }, [ref, actions]);

  /* The page behind stays put while the workspace is up. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!ref) return null;

  return (
    <div className="ws" role="dialog" aria-modal="true" aria-label={ref.prob.n} tabIndex={-1} ref={dialog}>
      {content ? (
        <Body key={pid} r={ref} content={content} />
      ) : (
        <div className="ws-loading">
          <button className="ws-iconbtn" onClick={actions.closeWork} aria-label="Close">
            <Icon name="chevron-left" size={18} />
          </button>
          {content === null ? (
            <p>This problem has no in-app version yet.</p>
          ) : (
            <>
              <div className="ws-spinner" aria-hidden="true" />
              <p>Opening {ref.prob.n}…</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

const initialCases = (spec: Spec): CaseDraft[] =>
  spec.tests
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.show)
    .map(({ t, i }, k) => ({ key: k + 1, origin: i, fields: caseFields(spec, t) }));

function sourceOf(spec: Spec): string {
  const lc = spec.lc;
  if (!lc?.num) return "original";
  return lc.premium ? `stands in for LeetCode ${lc.num}, premium` : `LeetCode ${lc.num}`;
}

let runSeq = 0;

function Body({ r, content }: { r: ProblemRef; content: ProblemContent }) {
  const { state, actions } = useApp();
  const { prob, day, track } = r;
  const T = TRACKS[track];
  const spec = content.spec;
  const pid = prob.id;
  const progress = state.data.tracks[track];
  const accepted = !!progress.accepted[pid];
  const wide = useMedia("(min-width: 900px)");
  const status = useRunnerStatus();

  const [prefs, setPrefs] = useState(loadPrefs);
  const [code, setCode] = useState(() => loadDraft(pid) ?? spec.starter);
  const [docRev, setDocRev] = useState(0);
  const [cases, setCases] = useState<CaseDraft[]>(() => initialCases(spec));
  const [activeCase, setActiveCase] = useState(0);
  const [consoleTab, setConsoleTab] = useState<"cases" | "result">("cases");
  const [paneTab, setPaneTab] = useState<"desc" | "solution">("desc");
  const [mobileTab, setMobileTab] = useState<"problem" | "code" | "tests">("problem");
  const [run, setRun] = useState<RunView | null>(null);
  const [copied, setCopied] = useState(false);
  /* summon counts the presses that should pull focus into the assistant;
     loaded stays true once it has been opened, so closing keeps the chat. */
  const [ask, setAsk] = useState({ open: false, summon: 0, loaded: false });

  /* Drafts: saved 400ms after the last keystroke, and on the way out. A draft
     identical to the starter is no draft at all. */
  const latest = useRef(code);
  latest.current = code;
  const saveTimer = useRef(0);
  const persist = (c: string) => (c === spec.starter ? clearDraft(pid) : saveDraft(pid, c));
  const onChange = (c: string) => {
    setCode(c);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => persist(c), 400);
  };
  useEffect(
    () => () => {
      window.clearTimeout(saveTimer.current);
      persist(latest.current);
    },
    /* Unmount only: Body is keyed by problem, so this is "leaving it". */
    []
  );

  const busy = run !== null && run.outcome === null;
  /* Synchronous re-entry guard: one keypress can reach both the editor's
     keymap and the window listener before React has re-rendered. */
  const inFlight = useRef(false);

  async function start(mode: "run" | "submit") {
    if (inFlight.current) return;
    inFlight.current = true;
    const select: number[] = [];
    const custom: Array<Record<string, string>> = [];
    const plan: PlanItem[] = [];
    if (mode === "submit") {
      spec.tests.forEach((_, i) => {
        select.push(i);
        plan.push({ kind: "test", test: i });
      });
    } else {
      const typed: PlanItem[] = [];
      for (const c of cases) {
        if (c.origin !== null && !isEdited(spec, c)) {
          select.push(c.origin);
          plan.push({ kind: "test", test: c.origin });
        } else {
          custom.push(c.fields);
          typed.push({ kind: "case", key: c.key });
        }
      }
      plan.push(...typed);
    }
    const request: RunRequest = {
      spec: content.specText,
      code,
      select,
      custom,
      ...(content.judge ? { judge: content.judge } : {}),
      ...(custom.length ? { reference: content.solution } : {}),
    };
    const id = ++runSeq;
    setRun({ id, mode, plan, progress: null, outcome: null, verdict: null });
    setConsoleTab("result");
    if (!wide) setMobileTab("tests");
    persist(code);

    const outcome = await runner.run(request, (p) =>
      setRun((cur) => (cur && cur.id === id && !cur.outcome ? { ...cur, progress: p } : cur))
    );
    inFlight.current = false;
    const verdict = verdictOf(outcome, mode);
    setRun((cur) => (cur && cur.id === id ? { ...cur, outcome, verdict, progress: null } : cur));
    if (mode === "submit" && verdict.tone === "ok") actions.accept(pid);
  }

  /* The assistant. The Ask button opens and closes it; ⌘K from anywhere
     brings it up (or focus back into it), and from inside puts it away. */
  const openAsk = useCallback(() => setAsk((a) => ({ open: true, summon: a.summon + 1, loaded: true })), []);
  const closeAsk = useCallback(() => setAsk((a) => ({ ...a, open: false })), []);

  /* Shortcuts that work wherever focus is; the editor has its own copies. */
  const startRef = useRef(start);
  startRef.current = start;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      /* The editor handles (and prevents) its own copy of the shortcut. */
      if (e.defaultPrevented) return;
      if (mod && e.key === "Enter") {
        e.preventDefault();
        void startRef.current(e.shiftKey ? "submit" : "run");
      } else if (e.key.toLowerCase() === "k" && !e.shiftKey && !e.altKey && (onMac() ? e.metaKey : e.ctrlKey)) {
        /* Ctrl alone on a Mac stays the editor's: Ctrl-K deletes to the end of the line there. */
        e.preventDefault();
        if (e.target instanceof HTMLElement && e.target.closest(".asst:not([hidden])")) closeAsk();
        else openAsk();
      } else if (e.key === "Escape" && !(e.target instanceof HTMLElement && e.target.closest(".cm-editor, textarea"))) {
        actions.closeWork();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [actions, openAsk, closeAsk]);

  const errorLine =
    run?.outcome?.compileError?.line ??
    run?.outcome?.results.find((x) => x.error?.line)?.error?.line ??
    null;

  const setFont = (d: number) => {
    const next = { ...prefs, font: Math.min(22, Math.max(11, prefs.font + d)) };
    setPrefs(next);
    savePrefs(next);
  };

  const reset = () => {
    if (code !== spec.starter && !window.confirm("Reset to the starter code? Your draft for this problem is cleared.")) return;
    setCode(spec.starter);
    clearDraft(pid);
    setDocRev((n) => n + 1);
  };

  /* The last run, as both the paste and the assistant describe it. */
  const lastRun = () => {
    const v = run?.verdict ?? null;
    const focus = v && run?.outcome ? run.outcome.results[v.focus] ?? null : null;
    return v ? { verdict: v, focus, label: focus ? labelFor(spec, run, focus.i) : null } : null;
  };

  const copyForClaude = () => {
    const text = claudePrompt({
      title: spec.title,
      source: sourceOf(spec),
      statement: content.statement,
      code,
      last: lastRun(),
    });
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  /* What a question takes along, read the moment it is sent. Behind a ref,
     so the assistant's props hold still while you type in the editor. */
  const askNow = (): AskContext => {
    const last = lastRun();
    return {
      problem: { title: spec.title, source: sourceOf(spec), statement: withoutLead(content.statement).trim() },
      code,
      run: last ? runReport(last) : null,
    };
  };
  const askRef = useRef(askNow);
  askRef.current = askNow;
  const readAsk = useCallback(() => askRef.current(), []);

  const assistant = ask.loaded && (
    <Suspense fallback={null}>
      <Assistant open={ask.open} summon={ask.summon} onClose={closeAsk} context={readAsk} wide={wide} />
    </Suspense>
  );

  const lcLink = spec.lc?.slug ? LC(spec.lc.slug) : null;
  const stationTag = `${T.unit} ${day.d} · ${day.stn}`;

  const header = (
    <header className="ws-head">
      <button className="ws-iconbtn" onClick={actions.closeWork} aria-label="Back to the line" title="Back (Esc)">
        <Icon name="chevron-left" size={18} />
      </button>
      <div className="ws-title">
        <h2>{spec.title}</h2>
        <div className="ws-meta">
          <span className={"diff " + spec.difficulty}>{DIFFN[spec.difficulty]}</span>
          <span className="ws-bullet" data-track={track} aria-label={T.name}>
            {T.bullet}
          </span>
          <span className="tag">{stationTag}</span>
          {progress.done[pid] && (
            <span className="ws-done">
              <Icon name="check" size={11} strokeWidth={3} />
              {accepted ? "passed" : "ticked"}
            </span>
          )}
          {lcLink ? (
            <a className="ws-lc" href={lcLink} target="_blank" rel="noopener">
              {"LC " + (spec.lc?.num ?? "")}
              <Icon name="arrow-up-right" size={11} />
            </a>
          ) : spec.lc?.premium ? (
            <span className="tag">{"LC " + spec.lc.num + " · premium"}</span>
          ) : null}
        </div>
      </div>
      <div className="ws-actions">
        {wide && <Stopwatch />}
        <button
          className="ws-btn ghost"
          onClick={ask.open ? closeAsk : openAsk}
          aria-pressed={ask.open}
          title={"Ask the assistant (" + modKey() + "+K)"}
        >
          <Icon name="sparkles" size={14} />
          {wide && "Ask"}
        </button>
        <button className={"ws-btn ghost" + (copied ? " ok" : "")} onClick={copyForClaude} title="Problem, code and last result, ready to paste into Claude">
          <Icon name={copied ? "check" : "copy"} size={14} />
          {wide && (copied ? "Copied" : "Copy for Claude")}
        </button>
        {busy ? (
          <button className="ws-btn" onClick={runner.stop} title="Stop">
            <Icon name="square" size={13} />
            Stop
          </button>
        ) : (
          <button className="ws-btn" onClick={() => void start("run")} title={"Run the cases (" + modKey() + "+Enter)"}>
            <Icon name="play" size={13} />
            Run
          </button>
        )}
        <button className="ws-btn primary" onClick={() => void start("submit")} disabled={busy} title={"Run every test (" + modKey() + "+Shift+Enter)"}>
          <Icon name="send" size={13} />
          Submit
        </button>
      </div>
    </header>
  );

  const editorPane = (
    <section className="ws-code" aria-label="Code">
      <div className="ws-toolbar">
        <span className="ws-lang">Python 3.14</span>
        <RunnerBadge phase={status.phase} />
        {status.phase === "failed" && (
          <button className="ws-linkbtn" onClick={() => void runner.warm().catch(() => {})}>
            Retry
          </button>
        )}
        <span className="ws-spacer" />
        <button className="ws-iconbtn sm" onClick={() => setFont(-1)} aria-label="Smaller text" title="Smaller text">
          <Icon name="minus" size={13} />
        </button>
        <span className="ws-font">{prefs.font}px</span>
        <button className="ws-iconbtn sm" onClick={() => setFont(1)} aria-label="Larger text" title="Larger text">
          <Icon name="plus" size={13} />
        </button>
        <button className="ws-linkbtn" onClick={reset} title="Back to the starter code">
          <Icon name="rotate-ccw" size={12} />
          Reset
        </button>
      </div>
      <div className="ws-editor">
        <Editor
          value={code}
          docKey={pid + ":" + docRev}
          onChange={onChange}
          onRun={() => void start("run")}
          onSubmit={() => void start("submit")}
          errorLine={errorLine}
          errorRev={run?.id ?? 0}
          fontSize={prefs.font}
          label={"Your solution to " + spec.title}
        />
      </div>
    </section>
  );

  const problemPane = (
    <ProblemPane content={content} tab={paneTab} onTab={setPaneTab} accepted={accepted} fontSize={prefs.font} />
  );

  const consolePane = (
    <ConsolePane
      spec={spec}
      cases={cases}
      onCases={setCases}
      activeCase={activeCase}
      onActiveCase={setActiveCase}
      tab={consoleTab}
      onTab={setConsoleTab}
      run={run}
    />
  );

  if (wide) {
    return (
      <>
        {header}
        <div className="ws-main">
          <Split
            dir="row"
            ratio={prefs.splitX}
            onRatio={(x) => setPrefs((p) => ({ ...p, splitX: x }))}
            onCommit={() => setPrefs((p) => (savePrefs(p), p))}
            label="Resize the statement"
          >
            {problemPane}
            <Split
              dir="col"
              ratio={prefs.splitY}
              onRatio={(y) => setPrefs((p) => ({ ...p, splitY: y }))}
              onCommit={() => setPrefs((p) => (savePrefs(p), p))}
              min={0.25}
              max={0.85}
              label="Resize the editor"
            >
              {editorPane}
              {consolePane}
            </Split>
          </Split>
        </div>
        {assistant}
      </>
    );
  }

  return (
    <>
      {header}
      <div className="ws-seg" role="tablist" aria-label="Workspace panes">
        {(["problem", "code", "tests"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={mobileTab === t} className={mobileTab === t ? "on" : ""} onClick={() => setMobileTab(t)}>
            {t === "problem" ? "Problem" : t === "code" ? "Code" : "Tests"}
            {t === "tests" && busy && <i className="ws-dot pulse" />}
            {t === "tests" && !busy && run?.verdict && <i className={"ws-dot " + run.verdict.tone} />}
          </button>
        ))}
      </div>
      {/* All three stay mounted, so switching panes keeps the editor's undo
          history and the statement's scroll position. */}
      <div className="ws-stack">
        <div className={"ws-pane" + (mobileTab === "problem" ? " on" : "")}>{problemPane}</div>
        <div className={"ws-pane" + (mobileTab === "code" ? " on" : "")}>{editorPane}</div>
        <div className={"ws-pane" + (mobileTab === "tests" ? " on" : "")}>{consolePane}</div>
      </div>
      {assistant}
    </>
  );
}

function labelFor(spec: Spec, run: RunView | null, i: number): string {
  const p = run?.plan[i];
  if (!p || p.kind === "case") return "a case I typed in";
  const t = spec.tests[p.test];
  return run?.mode === "submit" ? `test ${p.test + 1}${t?.label ? ` (${t.label})` : ""}` : "an example";
}

const onMac = () => /Mac|iPhone|iPad/.test(navigator.platform);
const modKey = () => (onMac() ? "⌘" : "Ctrl");

function RunnerBadge({ phase }: { phase: runner.RunnerPhase }) {
  const copy: Record<runner.RunnerPhase, string> = {
    cold: "Python idle",
    loading: "Loading Python…",
    ready: "Ready",
    busy: "Running",
    failed: "Python failed to load",
  };
  return (
    <span className={"ws-runner " + phase}>
      <i aria-hidden="true" />
      {copy[phase]}
    </span>
  );
}
