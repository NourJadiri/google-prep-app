import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type RefObject } from "react";
import { firstSpot, fit } from "../lib/placement";
import { loadSpot, saveSpot, type Spot } from "../lib/storage";

export interface DragHandlers {
  onPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: PointerEvent<HTMLElement>) => void;
}

/* On a desk the window is dragged by its header, resized by its corner (CSS resize), and remembered where it was left. */
export function useFloatingBox(panel: RefObject<HTMLElement | null>, wide: boolean) {
  const [spot, setSpot] = useState<Spot>(() => fit(loadSpot() ?? firstSpot()));
  const persist = useCallback(() => setSpot((s) => (saveSpot(s), s)), []);

  const drag = useRef<{ dx: number; dy: number; id: number } | null>(null);
  const endDrag = (e: PointerEvent<HTMLElement>) => {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    persist();
  };
  const dragHandlers: DragHandlers = {
    onPointerDown(e) {
      if (!wide || e.button !== 0 || (e.target as Element).closest("button")) return;
      drag.current = { dx: e.clientX - spot.x, dy: e.clientY - spot.y, id: e.pointerId };
      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    onPointerMove(e) {
      const d = drag.current;
      if (d && d.id === e.pointerId) setSpot((s) => fit({ ...s, x: e.clientX - d.dx, y: e.clientY - d.dy }));
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };

  useEffect(() => {
    const el = panel.current;
    if (!el || !wide) return;
    let save = 0;
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      /* A hidden window measures 0 x 0, which is not a size anyone chose. */
      if (!w || !h) return;
      setSpot((s) => (s.w === w && s.h === h ? s : { ...s, w, h }));
      window.clearTimeout(save);
      save = window.setTimeout(persist, 400);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      window.clearTimeout(save);
    };
  }, [panel, wide, persist]);

  useEffect(() => {
    const onResize = () => setSpot((s) => fit(s));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const style: CSSProperties | undefined = wide ? { left: spot.x, top: spot.y, width: spot.w, height: spot.h } : undefined;
  return { style, dragHandlers };
}
