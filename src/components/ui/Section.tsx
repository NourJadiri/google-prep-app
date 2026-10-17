import type { ReactNode } from "react";
import "./Section.css";

/** A heading over its content; adds no wrapper element. */
export default function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <div className="sectionlabel">{title}</div>
      {children}
    </>
  );
}
