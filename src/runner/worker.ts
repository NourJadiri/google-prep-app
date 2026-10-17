/* Deliberately dumb: load once, hand each request to the harness, stream its events back. Every clock lives on
 * the main thread, because a worker busy in somebody's `while True:` can't watch one. */

import harnessSource from "./harness.py?raw";
import type { FromWorker, ToWorker } from "./types";

/* The app compiles against the DOM lib, which the webworker lib can't share a program with. */
const scope = self as unknown as {
  postMessage(msg: FromWorker): void;
  onmessage: ((e: MessageEvent<ToWorker>) => void) | null;
};

/* Just the slice of Pyodide used here: the package itself is loaded at runtime, never bundled. */
interface PyProxyFn {
  (...args: unknown[]): unknown;
}
interface Pyodide {
  FS: { writeFile(path: string, data: string): void };
  runPython(code: string): unknown;
  pyimport(name: string): { run: PyProxyFn };
  setInterruptBuffer(buffer: Int32Array): void;
}
interface PyodideModule {
  loadPyodide(opts: {
    indexURL: string;
    stdout?: (s: string) => void;
    stderr?: (s: string) => void;
  }): Promise<Pyodide>;
}

const BASE = `/pyodide/${__PYODIDE_VERSION__}/`;

let run: PyProxyFn | null = null;
let interrupt: Int32Array | null = null;

const post = (msg: FromWorker) => scope.postMessage(msg);

async function init(sab: SharedArrayBuffer | null): Promise<void> {
  const t0 = performance.now();
  try {
    const mod = (await import(/* @vite-ignore */ `${BASE}pyodide.mjs`)) as PyodideModule;
    /* The harness captures what the user's code prints; anything else is interpreter noise. */
    const py = await mod.loadPyodide({ indexURL: BASE, stdout: () => {}, stderr: () => {} });
    if (sab) {
      interrupt = new Int32Array(sab);
      py.setInterruptBuffer(interrupt);
    }
    py.FS.writeFile("/home/pyodide/harness.py", harnessSource);
    run = py.pyimport("harness").run;
    post({ type: "ready", ms: Math.round(performance.now() - t0) });
  } catch (e) {
    post({ type: "init-failed", message: e instanceof Error ? e.message : String(e) });
  }
}

function execute(id: number, request: ToWorker & { type: "run" }): void {
  if (!run) {
    post({ type: "fatal", id, message: "The interpreter isn't loaded." });
    return;
  }
  /* A stale interrupt left over from the last run's Stop would kill this one at once. */
  if (interrupt) Atomics.store(interrupt, 0, 0);
  try {
    const summary = run(JSON.stringify(request.request), (data: string) =>
      post({ type: "event", id, data })
    );
    post({ type: "done", id, summary: String(summary) });
  } catch (e) {
    /* The harness catches everything Python can throw, so this is the interpreter itself breaking (nearly always
       the JS stack, blown by recursion through C). It can't be trusted again. */
    post({ type: "fatal", id, message: e instanceof Error ? e.message : String(e) });
  }
}

scope.onmessage = (e) => {
  const msg = e.data;
  if (msg.type === "init") void init(msg.interrupt);
  else if (msg.type === "run") execute(msg.id, msg);
};
