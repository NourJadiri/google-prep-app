import { useState } from "react";
import { loadPrefs, savePrefs } from "../../../lib/workspacePrefs";

const FONT_MIN = 11;
const FONT_MAX = 22;

/** Editor font size and the two split ratios, remembered across problems. */
export function useWorkspacePrefs() {
  const [prefs, setPrefs] = useState(loadPrefs);

  const stepFont = (d: number) => {
    const next = { ...prefs, font: Math.min(FONT_MAX, Math.max(FONT_MIN, prefs.font + d)) };
    setPrefs(next);
    savePrefs(next);
  };

  const setSplitX = (splitX: number) => setPrefs((p) => ({ ...p, splitX }));
  const setSplitY = (splitY: number) => setPrefs((p) => ({ ...p, splitY }));
  /* Saved from the update queue, so a key nudge's ratio, set a moment earlier in the same event, is in. */
  const commitSplits = () => setPrefs((p) => (savePrefs(p), p));

  return { ...prefs, stepFont, setSplitX, setSplitY, commitSplits };
}
