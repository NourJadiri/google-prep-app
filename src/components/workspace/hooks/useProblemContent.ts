import { useEffect, useState } from "react";
import { hasProblem, loadProblem, type ProblemContent } from "../../../data/problems";
import * as runner from "../../../runner/runner";

/** undefined while loading; null when the problem has no in-app version. Warms the Python runner as the load starts. */
export function useProblemContent(specId: string | null): ProblemContent | null | undefined {
  const [content, setContent] = useState<ProblemContent | null | undefined>(undefined);

  useEffect(() => {
    let live = true;
    setContent(undefined);
    if (!hasProblem(specId)) {
      setContent(null);
      return;
    }
    void runner.warm().catch(() => {});
    void loadProblem(specId).then((c) => {
      if (live) setContent(c);
    });
    return () => {
      live = false;
    };
  }, [specId]);

  return content;
}
