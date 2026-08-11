import { Fragment } from "react";
import { useApp } from "../../state/AppState";
import { TPL } from "../../data/templates";
import { focusDay } from "../../lib/engine";
import RitualLog from "./RitualLog";
import TemplateCard from "./TemplateCard";
import "./dojo.css";

export default function DojoView() {
  const { state } = useApp();
  const { data } = state;
  const day = focusDay(data);

  let group = "";

  return (
    <section className="view on">
      <div className="hero">
        <h1>
          The <b>dojo</b>
        </h1>
        <p>
          The daily ritual: write the day's template from a blank page, from memory. Then
          reveal and diff — the gap is the lesson.
        </p>
      </div>

      {/* Mount point kept from the reference so the DOM matches element for
          element — see the note in MetroView. */}
      <div id="dojoArea">
        <RitualLog day={day} logged={!!data.rituals[day.id]} />

        {TPL.map((t) => {
          const label = t.g !== group ? t.g : null;
          group = t.g;
          return (
            <Fragment key={t.id}>
              {label && <div className="sectionlabel">{label}</div>}
              <TemplateCard
                tpl={t}
                open={state.openTpl.includes(t.id)}
                shown={state.shownTpl.includes(t.id)}
              />
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
