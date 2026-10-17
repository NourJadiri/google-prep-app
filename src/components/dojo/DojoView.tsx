import { TPL } from "../../data/templates";
import { useTrack } from "../../hooks/useTrack";
import { useApp } from "../../state/AppState";
import DojoHero from "./DojoHero";
import NoRituals from "./NoRituals";
import RitualLog from "./RitualLog";
import TemplateGroup from "./TemplateGroup";
import { groupTemplates } from "./lib/groupTemplates";

const GROUPS = groupTemplates(TPL);

export default function DojoView() {
  const { state, actions } = useApp();
  const { focus: day, progress } = useTrack();

  return (
    <section className="view on">
      <DojoHero />

      {/* The regression suites select on this mount point. */}
      <div id="dojoArea">
        {day.ritual ? (
          <RitualLog
            day={day}
            ritual={day.ritual}
            logged={!!progress.rituals[day.id]}
            onToggle={actions.toggleRitual}
          />
        ) : (
          <NoRituals />
        )}

        {GROUPS.map((group) => (
          <TemplateGroup
            key={group.label}
            group={group}
            openIds={state.openTpl}
            shownIds={state.shownTpl}
            onToggle={actions.toggleTpl}
            onReveal={actions.revealTpl}
          />
        ))}
      </div>
    </section>
  );
}
