import { useApp } from "../../state/AppState";
import { scrollToTop } from "../../lib/scroll";
import TabButton from "./TabButton";
import { TABS } from "./lib/tabs";
import "./TabBar.css";

export default function TabBar() {
  const { state, actions } = useApp();

  return (
    <nav className="tabs" aria-label="Sections">
      {TABS.map((t) => (
        <TabButton
          key={t.id}
          icon={t.icon}
          label={t.label}
          current={state.tab === t.id}
          onSelect={() => {
            actions.setTab(t.id);
            scrollToTop();
          }}
        />
      ))}
    </nav>
  );
}
