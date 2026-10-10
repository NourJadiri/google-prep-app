import { Suspense, lazy, useEffect, type FunctionComponent } from "react";
import { useApp } from "./state/AppState";
import { TimerProvider } from "./state/TimerProvider";
import Header from "./components/layout/Header";
import TabBar from "./components/layout/TabBar";
import Celebrations from "./components/shared/Celebrations";
/* The editor, the markdown renderer and the runner client ride in their own
   chunk: the line loads as light as it ever did, and CodeMirror arrives the
   first time a problem opens. */
const Workspace = lazy(() => import("./components/workspace/Workspace"));
import LineView from "./components/line/LineView";
import MetroView from "./components/metro/MetroView";
import DojoView from "./components/dojo/DojoView";
import MeView from "./components/me/MeView";
import type { Tab } from "./types";

/* Keyed by Tab rather than string, so the lookup is total and the old
   `|| LineView` fallback is gone — an unhandled tab is now a compile error. */
const VIEWS: Record<Tab, FunctionComponent> = {
  line: LineView,
  metro: MetroView,
  dojo: DojoView,
  me: MeView,
};

export default function App() {
  const { state } = useApp();
  const View = VIEWS[state.tab];
  const track = state.data.track;

  /* The line being ridden tints the whole app: --accent and friends key off
     this attribute (tokens.css), so no component has to ask. */
  useEffect(() => {
    document.documentElement.dataset.track = track;
  }, [track]);

  return (
    <TimerProvider>
      <Header />
      <main>
        <View />
      </main>
      <TabBar />
      {state.work && (
        <Suspense fallback={<div className="ws-boot" aria-busy="true" />}>
          <Workspace pid={state.work} />
        </Suspense>
      )}
      <Celebrations />
    </TimerProvider>
  );
}
