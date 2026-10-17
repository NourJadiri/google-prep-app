import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./state/AppState";
import App from "./App";
// After App on purpose: the global sheets sit last in the bundle, below every component's own CSS.
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root is missing from index.html");

createRoot(rootEl).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);
