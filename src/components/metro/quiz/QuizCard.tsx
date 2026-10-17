import { currentCard } from "../../../lib/engine";
import type { Session } from "../../../types";
import RunCard from "../RunCard";
import AnswerOptions from "./AnswerOptions";
import QuizHeader from "./QuizHeader";
import QuizNav from "./QuizNav";
import QuizPrompt from "./QuizPrompt";
import RevealFooter from "./RevealFooter";
import StopsTrack from "./StopsTrack";

interface QuizCardProps {
  session: Session;
  onAnswer: (slot: number) => void;
  onNext: () => void;
  onQuit: () => void;
}

export default function QuizCard({ session: s, onAnswer, onNext, onQuit }: QuizCardProps) {
  const q = currentCard(s);
  if (!q) return null; // a run pointing past its own ids; unreachable in practice

  return (
    <RunCard>
      <QuizHeader type={q.t} step={s.i + 1} total={s.ids.length} streak={s.streak} xp={s.xp} />
      <QuizPrompt text={q.q} code={q.code} />
      <AnswerOptions question={q} session={s} onPick={onAnswer} />
      {s.phase === "reveal" ? (
        <RevealFooter explanation={q.x} last={s.i + 1 >= s.ids.length} onNext={onNext} onQuit={onQuit} />
      ) : (
        <QuizNav onQuit={onQuit} />
      )}
      <StopsTrack ids={s.ids} results={s.results} />
    </RunCard>
  );
}
