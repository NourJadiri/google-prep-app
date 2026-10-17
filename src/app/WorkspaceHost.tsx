import { Suspense, lazy } from "react";
import "./WorkspaceHost.css";

/* Its own chunk, so CodeMirror, the markdown renderer and the runner client arrive the first time a problem opens. */
const Workspace = lazy(() => import("../components/workspace/Workspace"));

export default function WorkspaceHost({ pid }: { pid: string }) {
  return (
    <Suspense fallback={<div className="ws-boot" aria-busy="true" />}>
      <Workspace pid={pid} />
    </Suspense>
  );
}
