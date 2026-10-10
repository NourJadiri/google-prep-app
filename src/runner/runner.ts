/* The main thread's side of the interpreter: one worker, one run at a time,
 * and every clock.
 *
 * A case gets its time limit the moment Python says it is calling the user's
 * code. When a limit runs out, the gentle way down is the interrupt buffer: a
 * SharedArrayBuffer Python polls between bytecodes, so the case ends with a
 * KeyboardInterrupt and the interpreter stays warm. That needs a
 * cross-origin-isolated page (the COOP/COEP headers in public/_headers and
 * vite.config.ts). Without it — or when the code is stuck somewhere Python
 * never polls — the worker is put down and a fresh one loads behind it. The
 * cases that finished are already here either way: the harness streams each
 * result the moment it has one.
 *
 * Like storage and sync, nothing here throws its way up into React.
 */

import type {
  CaseResult,
  FromWorker,
  HarnessEvent,
  RunOutcome,
  RunProgress,
  RunRequest,
  RunSummary,
} from "./types";

export type RunnerPhase = "cold" | "loading" | "ready" | "busy" | "failed";

export interface RunnerStatus {
  phase: RunnerPhase;
  /** How long the last interpreter took to load, for the status line. */
  loadMs: number;
  /** Why loading failed, when it did. */
  error: string | null;
  /** True when Stop and the time limits can interrupt without a reload. */
  interruptible: boolean;
}

/** Compiling the user's module, building inputs, answering a typed-in case
 *  with the reference: everything that isn't a timed case. */
const SETUP_LIMIT_MS = 12_000;
/** After an interrupt, how long Python gets to come back before the worker
 *  is replaced. */
const KILL_GRACE_MS = 1_200;

const isolated =
  typeof SharedArrayBuffer !== "undefined" &&
  (globalThis as { crossOriginIsolated?: boolean }).crossOriginIsolated === true;
const sab = isolated ? new SharedArrayBuffer(4) : null;
const flag = sab ? new Int32Array(sab) : null;

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
let status: RunnerStatus = {
  phase: "cold",
  loadMs: 0,
  error: null,
  interruptible: isolated,
};
const listeners = new Set<() => void>();

function set(patch: Partial<RunnerStatus>): void {
  status = { ...status, ...patch };
  listeners.forEach((l) => l());
}

export function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getStatus(): RunnerStatus {
  return status;
}

/* ------------------------------ lifecycle ------------------------------ */

/** Start loading the interpreter if nothing has yet. Safe to call often:
 *  the workspace calls it on open so the first Run doesn't wait. */
export function warm(): Promise<void> {
  if (ready) return ready;
  set({ phase: "loading", error: null });
  const w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  worker = w;
  const p = new Promise<void>((resolve, reject) => {
    const fail = (message: string) => {
      w.removeEventListener("message", onMessage);
      if (worker === w) {
        w.terminate();
        worker = null;
        ready = null;
      }
      set({ phase: "failed", error: message });
      reject(new Error(message));
    };
    const onMessage = (e: MessageEvent<FromWorker>) => {
      if (e.data.type === "ready") {
        w.removeEventListener("message", onMessage);
        set({ phase: active ? "busy" : "ready", loadMs: e.data.ms });
        resolve();
      } else if (e.data.type === "init-failed") {
        fail(e.data.message);
      }
    };
    w.addEventListener("message", onMessage);
    w.addEventListener("error", (ev) => fail(ev.message || "The Python worker failed to start."), {
      once: true,
    });
    w.postMessage({ type: "init", interrupt: sab });
  });
  ready = p;
  /* A failed load is reported through status; nobody has to catch this one. */
  p.catch(() => {});
  return p;
}

function replaceWorker(): void {
  worker?.terminate();
  worker = null;
  ready = null;
  set({ phase: "cold" });
  void warm().catch(() => {});
}

/* --------------------------------- runs -------------------------------- */

interface Active {
  id: number;
  total: number;
  results: CaseResult[];
  current: number | null;
  /** The input of the case in flight, so a case that never reports back can
   *  still say what it was chewing on. */
  currentInput: string[];
  timer: number;
  killTimer: number;
  aborted: RunOutcome["aborted"] | null;
  onProgress?: (p: RunProgress) => void;
  finish: (o: RunOutcome) => void;
  detach: () => void;
}

let active: Active | null = null;
let seq = 0;

function arm(a: Active, ms: number, onFire: () => void): void {
  clearTimeout(a.timer);
  a.timer = window.setTimeout(onFire, ms);
}

function progress(a: Active): void {
  a.onProgress?.({ current: a.current, results: a.results.slice() });
}

const ABORT_COPY: Record<NonNullable<RunOutcome["aborted"]>["reason"], string> = {
  tle: "Time Limit Exceeded",
  stopped: "Stopped",
  crash:
    "The interpreter ran out of the browser's stack on this test and has been restarted. Nearly always that's recursion running deep through C code — a generator expression, map() or sorted(key=…) inside a deep recursive call — or freeing a very deep structure your code built. Plain recursion and @cache are fine (an infinite one just raises RecursionError); an iterative rewrite always is.",
  "setup-timeout":
    "Your code didn't finish loading — a loop at the top level of the file that never ends, perhaps.",
};

/** Ask the case in flight to stop. Gentle if we can, final if we must. */
function abort(reason: NonNullable<RunOutcome["aborted"]>["reason"]): void {
  const a = active;
  if (!a || a.aborted) return;
  a.aborted = { reason, at: a.current, message: ABORT_COPY[reason] };
  clearTimeout(a.timer);
  if (flag && reason !== "crash") {
    Atomics.store(flag, 0, 2); // SIGINT: Python raises KeyboardInterrupt
    a.killTimer = window.setTimeout(() => hardStop(a), KILL_GRACE_MS);
  } else {
    hardStop(a);
  }
}

/* The worker is gone; finish the run from what already arrived. */
function hardStop(a: Active): void {
  if (active !== a) return;
  replaceWorker();
  const reason = a.aborted?.reason ?? "crash";
  if (a.current !== null) {
    a.results.push({
      i: a.current,
      status: reason === "setup-timeout" ? "stopped" : reason,
      ms: 0,
      input: a.currentInput,
    });
  }
  settle(a, { results: a.results, ms: 0 });
}

function settle(a: Active, summary: RunSummary): void {
  if (active !== a) return;
  clearTimeout(a.timer);
  clearTimeout(a.killTimer);
  a.detach();
  active = null;
  if (flag) Atomics.store(flag, 0, 0);
  if (status.phase === "busy") set({ phase: "ready" });

  /* Python's summary is authoritative for every case it finished; an abort
     rewrites the case it landed on, and anything after it never really ran. */
  let results = summary.results.length >= a.results.length ? summary.results : a.results;
  const ab = a.aborted;
  if (ab) {
    const stopAt = ab.at;
    results = results
      .filter((r) => stopAt === null || r.i <= stopAt)
      .map((r) =>
        r.i === stopAt || r.status === "interrupted"
          ? { ...r, status: ab.reason === "setup-timeout" ? "stopped" : ab.reason }
          : r
      );
  } else {
    results = results.map((r) => (r.status === "interrupted" ? { ...r, status: "stopped" } : r));
  }
  a.finish({
    ...summary,
    results,
    total: a.total,
    ...(ab ? { aborted: ab } : summary.interrupted ? { aborted: { reason: "stopped", at: null, message: ABORT_COPY.stopped } } : {}),
  });
}

/** Run one request. Resolves with whatever happened — never rejects, so the
 *  UI has exactly one path for "the run is over". */
export async function run(
  request: RunRequest,
  onProgress?: (p: RunProgress) => void
): Promise<RunOutcome> {
  const total = request.select.length + request.custom.length;
  if (active) {
    return { results: [], ms: 0, total, entryError: "A run is already in progress." };
  }
  try {
    await warm();
  } catch (e) {
    return {
      results: [],
      ms: 0,
      total,
      entryError:
        "Python couldn't load: " + (e instanceof Error ? e.message : String(e)) + ". Check the connection and try again.",
    };
  }
  const w = worker;
  if (!w) return { results: [], ms: 0, total, entryError: "Python isn't loaded." };
  set({ phase: "busy" });

  return new Promise<RunOutcome>((resolve) => {
    const id = ++seq;
    const a: Active = {
      id,
      total,
      results: [],
      current: null,
      currentInput: [],
      timer: 0,
      killTimer: 0,
      aborted: null,
      onProgress,
      finish: resolve,
      detach: () => w.removeEventListener("message", onMessage),
    };
    active = a;

    const onMessage = (e: MessageEvent<FromWorker>) => {
      const m = e.data;
      if (!("id" in m) || m.id !== id) return;
      if (m.type === "event") {
        let ev: HarnessEvent;
        try {
          ev = JSON.parse(m.data) as HarnessEvent;
        } catch {
          return;
        }
        if (a.aborted) {
          /* Past the abort, only the case it landed on still matters. */
          if (ev.t === "case" && ev.r.i === a.aborted.at) {
            a.results.push(ev.r);
          }
          return;
        }
        if (ev.t === "start") {
          a.current = ev.i;
          a.currentInput = ev.input;
          arm(a, ev.limit, () => abort("tle"));
        } else {
          a.results.push(ev.r);
          a.current = null;
          arm(a, SETUP_LIMIT_MS, () => abort("setup-timeout"));
        }
        progress(a);
      } else if (m.type === "done") {
        let summary: RunSummary;
        try {
          summary = JSON.parse(m.summary) as RunSummary;
        } catch {
          summary = { results: a.results, ms: 0 };
        }
        settle(a, summary);
      } else if (m.type === "fatal") {
        if (!a.aborted) a.aborted = { reason: "crash", at: a.current, message: ABORT_COPY.crash };
        hardStop(a);
      }
    };
    w.addEventListener("message", onMessage);
    arm(a, SETUP_LIMIT_MS, () => abort("setup-timeout"));
    w.postMessage({ type: "run", id, request });
  });
}

/** The Stop button. */
export function stop(): void {
  abort("stopped");
}
