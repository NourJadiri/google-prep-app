import { useLayoutEffect, type RefObject } from "react";

const MAX_HEIGHT = 140;

/* scrollHeight leaves out the borders that border-box counts, so they go back on, or the box comes up 2px short and grows a scrollbar for nothing. Below the cap nothing scrolls, so none shows up for a rounding error. */
export function useAutoGrow(ref: RefObject<HTMLTextAreaElement | null>, value: string) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const full = el.scrollHeight + el.offsetHeight - el.clientHeight;
    el.style.height = Math.min(full, MAX_HEIGHT) + "px";
    el.style.overflowY = full > MAX_HEIGHT ? "auto" : "hidden";
  }, [ref, value]);
}
