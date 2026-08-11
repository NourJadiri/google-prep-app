import { useApp } from "./state/AppState.jsx";
import { TimerProvider } from "./state/TimerProvider.jsx";
import Header from "./components/layout/Header.jsx";
import TabBar from "./components/layout/TabBar.jsx";
import Celebrations from "./components/shared/Celebrations.jsx";
import LineView from "./components/line/LineView.jsx";
import MetroView from "./components/metro/MetroView.jsx";
import DojoView from "./components/dojo/DojoView.jsx";
import MeView from "./components/me/MeView.jsx";

const VIEWS = { line: LineView, metro: MetroView, dojo: DojoView, me: MeView };

export default function App() {
  const { state } = useApp();
  const View = VIEWS[state.tab] || LineView;

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
