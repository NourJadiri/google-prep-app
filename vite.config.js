import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static SPA, single route — no base path, no proxying, nothing fetched at runtime.
export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist" },
  test: {
    environment: "node",
    include: ["src/**/*.test.js"],
  },
});
