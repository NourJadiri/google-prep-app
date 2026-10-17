import IconButton from "../ui/IconButton";
import Spinner from "../ui/Spinner";
import "./WorkspaceLoading.css";

interface WorkspaceLoadingProps {
  title: string;
  /** The problem has no in-app version, so there is nothing to wait for. */
  missing: boolean;
  onClose: () => void;
}

export default function WorkspaceLoading({ title, missing, onClose }: WorkspaceLoadingProps) {
  return (
    <div className="ws-loading">
      <IconButton icon="chevron-left" label="Close" onClick={onClose} />
      {missing ? (
        <p>This problem has no in-app version yet.</p>
      ) : (
        <>
          <Spinner />
          <p>Opening {title}…</p>
        </>
      )}
    </div>
  );
}
