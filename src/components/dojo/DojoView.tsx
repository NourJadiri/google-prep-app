import { Fragment } from "react";
import { useApp } from "../../state/AppState";
import { TPL } from "../../data/templates";
import { focusDay, progressOf } from "../../lib/engine";
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
        {day.ritual ? (
          <RitualLog day={day} ritual={day.ritual} logged={!!progressOf(data).rituals[day.id]} />
        ) : (
          <p className="dojo-local">
            No morning rituals on the Local — but the templates below are fair game whenever a stop
            leans on one.
          </p>
        )}

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
