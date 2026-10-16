import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// Static SPA, single route — no base path, no proxying. The only runtime fetches are
// cloud sync's /api/state calls and the assistant's /api/assistant, both served by the
// Worker (not by this dev server — `wrangler dev` after a build is the full-stack loop;
// here sync reports offline and the assistant finds no endpoint), and the Python
// interpreter, which is ours: Pyodide is served from this origin
// under /pyodide/<version>/, never from a CDN.

const PYODIDE_DIR = fileURLToPath(new URL("./node_modules/pyodide/", import.meta.url));
const PYODIDE_VERSION: string = JSON.parse(
  fs.readFileSync(path.join(PYODIDE_DIR, "package.json"), "utf8")
).version;
const PYODIDE_BASE = `pyodide/${PYODIDE_VERSION}/`;
/* Exactly what loadPyodide() fetches for the bare interpreter — no packages
   are ever installed, so the lock file is read but nothing it lists is. */
const PYODIDE_FILES: Record<string, string> = {
  "pyodide.mjs": "text/javascript",
  "pyodide.asm.mjs": "text/javascript",
  "pyodide.asm.wasm": "application/wasm",
  "python_stdlib.zip": "application/zip",
  "pyodide-lock.json": "application/json",
};

/* Cross-origin isolation is what lets the runner share an interrupt buffer
   with the worker, so Stop and the time limits don't cost a reload. The app
   loads nothing cross-origin, so require-corp costs nothing. Production
   gets the same pair from public/_headers. */
const ISOLATION = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

function selfHostedPyodide(): Plugin {
  return {
    name: "self-hosted-pyodide",
    configureServer(server) {
      server.middlewares.use(`/${PYODIDE_BASE}`, (req, res, next) => {
        const name = (req.url ?? "").split("?")[0]?.replace(/^\//, "") ?? "";
        const type = PYODIDE_FILES[name];
        if (!type) return next();
        res.setHeader("Content-Type", type);
        for (const [k, v] of Object.entries(ISOLATION)) res.setHeader(k, v);
        fs.createReadStream(path.join(PYODIDE_DIR, name)).pipe(res);
      });
    },
    generateBundle() {
      for (const name of Object.keys(PYODIDE_FILES)) {
        this.emitFile({
          type: "asset",
          fileName: PYODIDE_BASE + name,
          source: fs.readFileSync(path.join(PYODIDE_DIR, name)),
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), selfHostedPyodide()],
  define: { __PYODIDE_VERSION__: JSON.stringify(PYODIDE_VERSION) },
  /* The worker imports Pyodide at runtime from an absolute URL; an ES-module
     worker is what makes that import legal (Pyodide refuses classic ones). */
  worker: { format: "es" },
  server: { headers: ISOLATION },
  preview: { headers: ISOLATION },
  build: { outDir: "dist" },
});
