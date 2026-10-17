import { useEffect } from "react";
import { PROB_INDEX, specOf } from "../../data/tracks";
import { useApp } from "../../state/AppState";
import { useDialogFocus } from "./hooks/useDialogFocus";
import { useProblemContent } from "./hooks/useProblemContent";
import { useScrollLock } from "./hooks/useScrollLock";
import WorkspaceBody from "./WorkspaceBody";
import WorkspaceLoading from "./WorkspaceLoading";
import "./Workspace.css";

export default function Workspace({ pid }: { pid: string }) {
  const { actions } = useApp();
  const problemRef = PROB_INDEX[pid];
  const dialog = useDialogFocus();
  const content = useProblemContent(problemRef ? specOf(problemRef.prob) : null);

  /* An id no line carries (only reachable from a stale session) closes the workspace rather than rendering an empty shell. */
  useEffect(() => {
    if (!problemRef) actions.closeWork();
  }, [problemRef, actions]);

  useScrollLock();

  if (!problemRef) return null;

  return (
    <div className="ws" role="dialog" aria-modal="true" aria-label={problemRef.prob.n} tabIndex={-1} ref={dialog}>
      {content ? (
        /* Keyed by problem, so the body unmounting means leaving the problem: it flushes the draft then. */
        <WorkspaceBody key={pid} problemRef={problemRef} content={content} />
      ) : (
        <WorkspaceLoading title={problemRef.prob.n} missing={content === null} onClose={actions.closeWork} />
      )}
    </div>
  );
}
