/* The Python interpreter, in its own thread.
 *
 * Pyodide is self-hosted under /pyodide/<version>/ (vite.config.ts serves it
 * in dev and copies it into dist/), and imported at runtime rather than
 * bundled, so the 13 MB only moves when a workspace first opens.
 *
 * The worker is deliberately dumb: load once, then hand each request to the
 * harness and stream its events back. Every clock lives on the main thread,
 * because a worker busy running somebody's `while True:` can't watch one. */

import harnessSource from "./harness.py?raw";
import type { FromWorker, ToWorker } from "./types";

/* The app compiles against the DOM lib, and the webworker lib can't share a
   program with it; this is the whole of the worker scope this file uses. */
const scope = self as unknown as {
  postMessage(msg: FromWorker): void;
  onmessage: ((e: MessageEvent<ToWorker>) => void) | null;
};

/* The slice of Pyodide this file touches, so the package's types never have
   to be imported into a bundle that never contains the package. */
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
    /* Anything the harness doesn't capture (it captures everything the
       user's code prints) is interpreter noise; keep it out of the console. */
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
  /* A stale interrupt from the last run's Stop would kill this one at once. */
  if (interrupt) Atomics.store(interrupt, 0, 0);
  try {
    const summary = run(JSON.stringify(request.request), (data: string) =>
      post({ type: "event", id, data })
    );
    post({ type: "done", id, summary: String(summary) });
  } catch (e) {
    /* The harness catches everything Python can throw, so arriving here means
       the interpreter itself broke — almost always the JS stack, blown by
       recursion that went through C. It can't be trusted again. */
    post({ type: "fatal", id, message: e instanceof Error ? e.message : String(e) });
  }
}

scope.onmessage = (e) => {
  const msg = e.data;
  if (msg.type === "init") void init(msg.interrupt);
  else if (msg.type === "run") execute(msg.id, msg);
};
