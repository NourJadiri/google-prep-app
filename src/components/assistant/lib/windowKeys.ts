import type { KeyboardEvent } from "react";

/* preventDefault is what keeps these from the workspace's key listener, which skips handled keys: Esc would leave the problem, ⌘Enter would run the code. */
export function onWindowKeyDown(e: KeyboardEvent<HTMLElement>, close: () => void): void {
  if (e.key === "Escape") {
    e.preventDefault();
    close();
  } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
  }
}
