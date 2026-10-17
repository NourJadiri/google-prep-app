import type { ReactNode } from "react";
import "./SheetHint.css";

export default function SheetHint({ children }: { children: ReactNode }) {
  return <p className="qrhint">{children}</p>;
}
