import type { ReactNode } from "react";
import "./ChatNote.css";

export default function ChatNote({ children }: { children: ReactNode }) {
  return <p className="asst-note">{children}</p>;
}
