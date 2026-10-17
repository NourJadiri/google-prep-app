import { useCallback, useState } from "react";

interface WindowState {
  open: boolean;
  /** Counts the presses that should pull focus into the window. */
  summon: number;
  /** Stays true once opened, so the window (and its chat) stays mounted. */
  loaded: boolean;
}

const shown = (a: WindowState): WindowState => ({ open: true, summon: a.summon + 1, loaded: true });
const hidden = (a: WindowState): WindowState => ({ ...a, open: false });

export function useAssistantWindow() {
  const [state, setState] = useState<WindowState>({ open: false, summon: 0, loaded: false });
  const show = useCallback(() => setState(shown), []);
  const hide = useCallback(() => setState(hidden), []);
  const toggle = useCallback(() => setState((a) => (a.open ? hidden(a) : shown(a))), []);
  return { ...state, show, hide, toggle };
}
