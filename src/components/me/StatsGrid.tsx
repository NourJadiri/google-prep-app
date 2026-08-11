import { TOTAL } from "../../data/plan";
import { accuracy, problemsDone, ritualsLogged, stationsCleared } from "../../lib/engine";
import type { PersistedData } from "../../types";

const Stat = ({ value, label }: { value: string | number; label: string }) => (
  <div className="stat">
    <b>{value}</b>
    <span>{label}</span>
  </div>
);

export default function StatsGrid({ data }: { data: PersistedData }) {
  return (
    <div className="statgrid">
      <Stat value={problemsDone(data) + "/" + TOTAL} label="problems" />
      <Stat value={stationsCleared(data) + "/7"} label="stations" />
      <Stat value={ritualsLogged(data) + "/7"} label="rituals" />
      <Stat value={data.quiz.answered} label="cards" />
      <Stat value={accuracy(data) + "%"} label="accuracy" />
      <Stat value={data.streak.best} label="best streak" />
    </div>
  );
}
