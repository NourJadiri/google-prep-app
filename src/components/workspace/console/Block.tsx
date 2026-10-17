import type { ReactNode } from "react";
import "./Block.css";

export default function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="ws-block">
      <div className="ws-block-title">{title}</div>
      {children}
    </div>
  );
}
