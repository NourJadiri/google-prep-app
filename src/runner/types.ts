/* Test data stays on the Python side: the spec crosses as its raw JSON text and results come back as display
 * strings, so a 10**18 in a test never has to survive a JS double. */

/** `select` picks spec tests by index; `custom` are cases typed into the Testcase tab, one literal per parameter
 *  name (or `ops`/`args` for a design problem). */
export interface RunRequest {
  /** The problem's spec.json, verbatim. */
  spec: string;
  code: string;
  select: number[];
  custom: Array<Record<string, string>>;
  judge?: string;
  /** Only needed to answer custom cases. */
  reference?: string;
}

export type CaseStatus =
  | "pass"
  | "fail"
  | "error"
  /** Set by the runner, not Python. */
  | "tle"
  | "stopped"
  /** The interpreter itself died on this case. */
  | "crash"
  /** A typed-in input that didn't parse. */
  | "invalid"
  /** A typed-in case the reference couldn't answer: output only, no verdict. */
  | "ran"
  /** Interrupted mid-call; the runner turns this into tle or stopped. */
  | "interrupted";

export interface CaseError {
  type: string;
  message: string;
  /** Deepest line of the user's code in the traceback, 1-based. */
  line: number | null;
  traceback: string;
  hint: string | null;
}

export interface CaseResult {
  /** Index into the run's cases: selected spec tests first, then custom. */
  i: number;
  status: CaseStatus;
  ms: number;
  input: string[];
  got?: string;
  expected?: string;
  stdout?: string;
  error?: CaseError;
  message?: string;
  label?: string | null;
  perf?: boolean;
  custom?: boolean;
  /** Why a custom case has no expected output. */
  refError?: string;
}

export interface RunSummary {
  results: CaseResult[];
  ms: number;
  stdout?: string;
  compileError?: CaseError;
  entryError?: string;
  interrupted?: boolean;
}

/** The summary plus what only the main thread could see: a clock that ran out, a crash, a stop. */
export interface RunOutcome extends RunSummary {
  /** Cases asked for, so "4 of 30 ran" can be said. */
  total: number;
  aborted?: {
    reason: "tle" | "stopped" | "crash" | "setup-timeout";
    /** The case it happened on, if it happened inside one. */
    at: number | null;
    message: string;
  };
}

export interface RunProgress {
  /** Index of the case running now, or null between cases. */
  current: number | null;
  /** Results so far, in run order. */
  results: CaseResult[];
}

export type ToWorker =
  | { type: "init"; interrupt: SharedArrayBuffer | null }
  | { type: "run"; id: number; request: RunRequest };

export type FromWorker =
  | { type: "ready"; ms: number }
  | { type: "init-failed"; message: string }
  /** One harness event, still JSON: {"t":"start",...} or {"t":"case",...}. */
  | { type: "event"; id: number; data: string }
  | { type: "done"; id: number; summary: string }
  /** The interpreter can no longer be used; the runner replaces the worker. */
  | { type: "fatal"; id: number; message: string };

export type HarnessEvent =
  | { t: "start"; i: number; limit: number; input: string[] }
  | { t: "case"; r: CaseResult };
