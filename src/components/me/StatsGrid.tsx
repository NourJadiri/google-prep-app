import { totalOf } from "../../data/tracks";
import {
  accuracy,
  problemsDone,
  progressOf,
  ritualsLogged,
  stationsCleared,
  trackOf,
} from "../../lib/engine";
import type { PersistedData } from "../../types";

const Stat = ({ value, label }: { value: string | number; label: string }) => (
  <div className="stat">
    <b>{value}</b>
    <span>{label}</span>
  </div>
);

/* The line being ridden, plus the two numbers both lines share (cards and
   streak). The Local has no rituals, so its third tile counts problems that
   passed every test in the editor instead. */
export default function StatsGrid({ data }: { data: PersistedData }) {
  const T = trackOf(data);
  const t = progressOf(data);
  const passed = Object.keys(t.accepted).length;
  return (
    <div className="statgrid">
      <Stat value={problemsDone(data) + "/" + totalOf(T.id)} label="problems" />
      <Stat value={stationsCleared(data) + "/" + T.plan.length} label="stations" />
      {T.plan.some((d) => d.ritual) ? (
        <Stat value={ritualsLogged(data) + "/" + T.plan.length} label="rituals" />
      ) : (
        <Stat value={passed} label="passed in editor" />
      )}
      <Stat value={data.quiz.answered} label="cards" />
      <Stat value={accuracy(data) + "%"} label="accuracy" />
      <Stat value={data.streak.best} label="best streak" />
    </div>
  );
}
