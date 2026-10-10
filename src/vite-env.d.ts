/// <reference types="vite/client" />

/** The self-hosted Pyodide's version, from node_modules/pyodide via vite.config.ts —
 *  it names the /pyodide/<version>/ directory the worker loads from. */
declare const __PYODIDE_VERSION__: string;
