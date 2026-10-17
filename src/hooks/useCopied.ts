import { useCallback, useEffect, useRef, useState } from "react";

export function useCopied(ms: number): [copied: boolean, copy: (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = useCallback(
    (text: string) => {
      navigator.clipboard?.writeText(text).catch(() => {});
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), ms);
    },
    [ms]
  );
  return [copied, copy];
}
