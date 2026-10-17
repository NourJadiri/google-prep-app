import { useEffect, useRef } from "react";
import * as storage from "../../lib/storage";
import * as sync from "../../lib/sync";

export function usePageLifecycle(inRun: boolean) {
  const inRunRef = useRef(inRun);
  inRunRef.current = inRun;

  // iOS can discard a backgrounded tab without firing unload, so flush on the way out.
  // Coming back wakes sync, but never mid-run: an adoption would yank the deck from the reader.
  useEffect(() => {
    const flush = () => {
      storage.flush();
      sync.flush();
    };
    const onVisibility = () => {
      flush();
      if (!document.hidden && !inRunRef.current) sync.wake();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}
