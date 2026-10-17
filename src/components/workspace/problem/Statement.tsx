import { useMemo } from "react";
import { sections } from "../lib/markdown";
import Markdown from "../Markdown";
import HintBox from "./HintBox";
import ProblemHeading from "./ProblemHeading";
import TopicList from "./TopicList";
import "./Statement.css";

const HINT = /^aim for$/i;
const FOLLOW = /^follow-ups?/i;

interface StatementProps {
  statement: string;
  topics: string[];
}

export default function Statement({ statement, topics }: StatementProps) {
  const parts = useMemo(() => sections(statement), [statement]);
  const main = parts.filter((s) => !HINT.test(s.title) && !FOLLOW.test(s.title));
  const hint = parts.find((s) => HINT.test(s.title));
  const follow = parts.find((s) => FOLLOW.test(s.title));

  return (
    <>
      {topics.length > 0 && <TopicList topics={topics} />}
      {main.map((s) => (
        <div key={s.title} className="ws-sec">
          <ProblemHeading>{s.title}</ProblemHeading>
          <Markdown text={s.body} />
        </div>
      ))}
      {hint && (
        <HintBox icon="lightbulb" title="Hint — what to aim for">
          <Markdown text={hint.body} />
        </HintBox>
      )}
      {follow && (
        <HintBox icon="arrow-right" title="Follow-ups an interviewer might ask">
          <Markdown text={follow.body} />
        </HintBox>
      )}
    </>
  );
}
