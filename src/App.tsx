import { useApp } from "./state/AppState";
import { TimerProvider } from "./state/TimerProvider";
import Header from "./components/layout/Header";
import TabBar from "./components/layout/TabBar";
import Celebrations from "./components/shared/celebrations/Celebrations";
import { useTrackTheme } from "./app/hooks/useTrackTheme";
import { VIEWS } from "./app/views";
import WorkspaceHost from "./app/WorkspaceHost";

export default function App() {
  const { state } = useApp();
  const View = VIEWS[state.tab];
  useTrackTheme();

  return (
    <TimerProvider>
      <Header />
      <main>
        <View />
      </main>
      <TabBar />
      {state.work && <WorkspaceHost pid={state.work} />}
      <Celebrations />
    </TimerProvider>
  );
}
