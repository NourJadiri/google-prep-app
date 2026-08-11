import { TOTAL } from "../../data/plan.js";
import { accuracy, problemsDone, ritualsLogged, stationsCleared } from "../../lib/engine.js";

const Stat = ({ value, label }) => (
  <div className="stat">
    <b>{value}</b>
    <span>{label}</span>
  </div>
);

export default function StatsGrid({ data }) {
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
