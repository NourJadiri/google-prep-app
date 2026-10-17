import type { ReactNode } from "react";
import "./Note.css";

export default function Note({ children }: { children: ReactNode }) {
  return <p className="asst-note">{children}</p>;
}
