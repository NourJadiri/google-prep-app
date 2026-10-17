import CodeBlock from "../../shared/CodeBlock";
import "./QuizPrompt.css";

export default function QuizPrompt({ text, code }: { text: string; code?: string }) {
  return (
    <>
      <p className="qtext">{text}</p>
      {code && <CodeBlock code={code} />}
    </>
  );
}
