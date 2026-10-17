import type { RefObject } from "react";
import "./TransferBox.css";

interface TransferBoxProps {
  boxRef: RefObject<HTMLTextAreaElement | null>;
  open: boolean;
  value: string;
  onChange: (value: string) => void;
}

/** The export to copy and the place to paste one back; hidden until the first Export or Import. */
export default function TransferBox({ boxRef, open, value, onChange }: TransferBoxProps) {
  return (
    <textarea
      ref={boxRef}
      className={"io" + (open ? " on" : "")}
      spellCheck="false"
      placeholder="Paste an export here, then tap Import again."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Progress export and import"
    />
  );
}
