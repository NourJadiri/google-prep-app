import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static SPA, single route — no base path, no proxying. The only runtime fetches are
// cloud sync's /api/state calls, served by Pages Functions (not by this dev server —
// `wrangler pages dev dist` is the full-stack loop; here sync just reports offline).
export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist" },
});
