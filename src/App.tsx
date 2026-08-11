import type { FunctionComponent } from "react";
import { useApp } from "./state/AppState";
import { TimerProvider } from "./state/TimerProvider";
import Header from "./components/layout/Header";
import TabBar from "./components/layout/TabBar";
import Celebrations from "./components/shared/Celebrations";
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

  return (
    <TimerProvider>
      <Header />
      <main>
        <View />
      </main>
      <TabBar />
      <Celebrations />
    </TimerProvider>
  );
}
