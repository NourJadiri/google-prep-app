import type { ReactNode } from "react";
import IconButton from "../../ui/IconButton";
import "./WorkspaceHeader.css";

interface WorkspaceHeaderProps {
  title: string;
  onClose: () => void;
  meta: ReactNode;
  actions: ReactNode;
}

export default function WorkspaceHeader({ title, onClose, meta, actions }: WorkspaceHeaderProps) {
  return (
    <header className="ws-head">
      <IconButton icon="chevron-left" label="Back to the line" title="Back (Esc)" onClick={onClose} />
      <div className="ws-title">
        <h2>{title}</h2>
        {meta}
      </div>
      {actions}
    </header>
  );
}
