import type { Problem } from "../../types";
import Icon from "../shared/Icon";
import { problemAction } from "./lib/problemAction";
import "./ProblemAction.css";

interface ProblemActionProps {
  prob: Problem;
  onOpenEditor: () => void;
}

export default function ProblemAction({ prob, onOpenEditor }: ProblemActionProps) {
  const action = problemAction(prob);

  switch (action.kind) {
    case "editor":
      return (
        <button
          className="golink code"
          onClick={onOpenEditor}
          aria-label={"Solve " + prob.n + " in the editor"}
          title="Open in the editor"
        >
          <Icon name="code" size={16} />
        </button>
      );
    case "link":
      return (
        <a className="golink" href={action.url} target="_blank" rel="noopener" aria-label={"Open " + prob.n}>
          <Icon name="arrow-up-right" size={16} />
        </a>
      );
    case "none":
      return null;
  }
}
