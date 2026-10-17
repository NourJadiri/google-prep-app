import { useLayoutEffect, useRef } from "react";

const THRESHOLD = 48;

/* The log follows new content down, unless you've scrolled up to read. */
export function useStickToBottom(follow: readonly unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  const stuck = useRef(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && stuck.current) el.scrollTop = el.scrollHeight;
  }, follow);

  const onScroll = () => {
    const el = ref.current;
    if (el) stuck.current = el.scrollHeight - el.scrollTop - el.clientHeight < THRESHOLD;
  };

  const pin = () => {
    stuck.current = true;
  };

  return { ref, onScroll, pin };
}
