import { useRef } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

const KEY_STEP = 0.03;

interface SplitHandleOptions {
  dir: "row" | "col";
  ratio: number;
  min: number;
  max: number;
  onRatio: (r: number) => void;
  /** Called once a drag or key nudge settles, to persist. */
  onCommit?: () => void;
}

/** Turns drags and arrow keys on a handle into ratios. `box` goes on the element that holds both panes.
 *  Pointer capture keeps a drag alive when the cursor outruns the handle, and the `dragging` class on the box
 *  stops the panes from eating the moves meanwhile. */
export function useSplitHandle({ dir, ratio, min, max, onRatio, onCommit }: SplitHandleOptions) {
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const clamp = (r: number) => Math.min(max, Math.max(min, r));

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    box.current?.classList.add("dragging");
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
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

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const back = dir === "row" ? "ArrowLeft" : "ArrowUp";
    const fwd = dir === "row" ? "ArrowRight" : "ArrowDown";
    if (e.key !== back && e.key !== fwd) return;
    e.preventDefault();
    onRatio(clamp(ratio + (e.key === fwd ? KEY_STEP : -KEY_STEP)));
    onCommit?.();
  };

  return { box, handleProps: { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end, onKeyDown } };
}
