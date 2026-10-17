import { useTrack } from "../../../hooks/useTrack";
import { runResultCopy } from "../../../lib/engine";
import type { Session } from "../../../types";
import ButtonRow from "../../ui/ButtonRow";
import PillButton from "../../ui/PillButton";
import RunCard from "../RunCard";
import ResultStat from "./ResultStat";
import "./RunResult.css";

interface RunResultProps {
  session: Session;
  onAgain: () => void;
  onDecks: () => void;
}

export default function RunResult({ session: s, onAgain, onDecks }: RunResultProps) {
  const { track } = useTrack();
  const total = s.ids.length;
  const missed = s.results.filter((r) => !r).length;

  return (
    <RunCard className="result">
      <div className="big">{s.right + "/" + total}</div>
      <div className="sub">{runResultCopy(track, s.right, total)}</div>
      <div className="row">
        <ResultStat value={"+" + s.xp} label="XP" />
        <ResultStat value={s.best} label="best streak" />
        <ResultStat value={missed} label="to redemption" />
      </div>
      <ButtonRow>
        <PillButton onClick={onAgain}>Run it again</PillButton>
        <PillButton onClick={onDecks}>Decks</PillButton>
      </ButtonRow>
    </RunCard>
  );
}
