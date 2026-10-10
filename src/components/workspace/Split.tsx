import { useRef } from "react";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";

/* Two panes and a handle between them. The ratio lives with the caller (it
   persists in workspace prefs); this only turns drags and arrow keys into a
   new ratio. Pointer capture keeps the drag alive when the cursor outruns the
   handle — over the editor, say — and the overlay class stops the editor and
   the statement from eating the moves mid-drag. */

interface SplitProps {
  dir: "row" | "col";
  ratio: number;
  onRatio: (r: number) => void;
  /** Called once a drag or key nudge settles, to persist. */
  onCommit?: () => void;
  min?: number;
  max?: number;
  label: string;
  children: [ReactNode, ReactNode];
}

export default function Split({
  dir,
  ratio,
  onRatio,
  onCommit,
  min = 0.2,
  max = 0.8,
  label,
  children,
}: SplitProps) {
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const clamp = (r: number) => Math.min(max, Math.max(min, r));

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !box.current) return;
    const rect = box.current.getBoundingClientRect();
    const r = dir === "row" ? (e.clientX - rect.left) / rect.width : (e.clientY - rect.top) / rect.height;
    onRatio(clamp(r));
  };

  const end = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    box.current?.classList.remove("dragging");
    e.currentTarget.releasePointerCapture(e.pointerId);
    onCommit?.();
  };

  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    const back = dir === "row" ? "ArrowLeft" : "ArrowUp";
    const fwd = dir === "row" ? "ArrowRight" : "ArrowDown";
    if (e.key !== back && e.key !== fwd) return;
    e.preventDefault();
    onRatio(clamp(ratio + (e.key === fwd ? 0.03 : -0.03)));
    onCommit?.();
  };

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
        onPointerDown={(e) => {
          dragging.current = true;
          box.current?.classList.add("dragging");
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onKeyDown={key}
      />
      <div className="split-b">{children[1]}</div>
    </div>
  );
}
