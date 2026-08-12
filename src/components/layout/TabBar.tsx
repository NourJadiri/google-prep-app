import { useApp } from "../../state/AppState";
import type { Tab } from "../../types";
import Icon, { type IconName } from "../shared/Icon";
import "./TabBar.css";

const TABS: ReadonlyArray<{ id: Tab; ic: IconName; label: string }> = [
  { id: "line", ic: "route", label: "Line" },
  { id: "metro", ic: "train", label: "Metro" },
  { id: "dojo", ic: "code", label: "Dojo" },
  { id: "me", ic: "chart", label: "Me" },
];

export default function TabBar() {
  const { state, actions } = useApp();

  return (
    <nav className="tabs" aria-label="Sections">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={"tab" + (state.tab === t.id ? " on" : "")}
          aria-current={state.tab === t.id ? "page" : undefined}
          onClick={() => {
            actions.setTab(t.id);
            window.scrollTo(0, 0);
          }}
        >
          <span className="ic">
            <Icon name={t.ic} size={20} strokeWidth={1.8} />
          </span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
