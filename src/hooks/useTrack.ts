import { focusDay, progressOf, trackOf } from "../lib/engine";
import { useApp } from "../state/AppState";

/** The line being ridden: its definition, this device's progress on it, and the day in focus. */
export function useTrack() {
  const { data } = useApp().state;
  return { data, track: trackOf(data), progress: progressOf(data), focus: focusDay(data) };
}
