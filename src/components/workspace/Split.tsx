import type { ReactNode } from "react";
import { useSplitHandle } from "./hooks/useSplitHandle";
import "./Split.css";

interface SplitProps {
  dir: "row" | "col";
  /** Lives with the caller, which persists it. */
  ratio: number;
  onRatio: (r: number) => void;
  onCommit?: () => void;
  min?: number;
  max?: number;
  label: string;
  children: [ReactNode, ReactNode];
}

export default function Split({ dir, ratio, onRatio, onCommit, min = 0.2, max = 0.8, label, children }: SplitProps) {
  const { box, handleProps } = useSplitHandle({ dir, ratio, min, max, onRatio, onCommit });

  return (
    <div className={"split split-" + dir} ref={box}>
      <div className="split-a" style={{ flexBasis: ratio * 100 + "%" }}>
        {children[0]}
      </div>
      <div
        className="split-handle"
        role="separator"
        aria-orientation={dir === "row" ? "vertical" : "horizontal"}
        aria-label={label}
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={Math.round(min * 100)}
        aria-valuemax={Math.round(max * 100)}
        tabIndex={0}
        {...handleProps}
      />
      <div className="split-b">{children[1]}</div>
    </div>
  );
}
