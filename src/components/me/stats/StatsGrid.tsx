import { totalOf } from "../../../data/tracks";
import {
  accuracy,
  problemsDone,
  progressOf,
  ritualsLogged,
  stationsCleared,
  trackOf,
} from "../../../lib/engine";
import type { PersistedData } from "../../../types";
import Stat from "./Stat";
import "./StatsGrid.css";

export default function StatsGrid({ data }: { data: PersistedData }) {
  const T = trackOf(data);
  const passed = Object.keys(progressOf(data).accepted).length;
  return (
    <div className="statgrid">
      <Stat value={problemsDone(data) + "/" + totalOf(T.id)} label="problems" />
      <Stat value={stationsCleared(data) + "/" + T.plan.length} label="stations" />
      {/* The Local has no rituals; its third tile counts problems that passed every test in the editor. */}
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
