import { useEffect } from "react";
import { useApp } from "../../state/AppState";

/** Tints the whole app by the line being ridden: tokens.css and the tinted components key off `<html data-track>`. */
export function useTrackTheme(): void {
  const track = useApp().state.data.track;

  useEffect(() => {
    document.documentElement.dataset.track = track;
  }, [track]);
}
