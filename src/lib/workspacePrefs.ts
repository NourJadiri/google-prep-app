const KEY = "onsite-express-workspace-v1";

interface WorkspacePrefs {
  /** Editor font size in px. */
  font: number;
  /** Statement pane's share of the width, desktop only. */
  splitX: number;
  /** Editor's share of the right column's height. */
  splitY: number;
}

const DEFAULT_PREFS: WorkspacePrefs = { font: 14, splitX: 0.42, splitY: 0.62 };

export function loadPrefs(): WorkspacePrefs {
  try {
    const raw = localStorage.getItem(KEY);
    const p = raw ? (JSON.parse(raw) as Partial<WorkspacePrefs>) : {};
    const n = (x: unknown, lo: number, hi: number, d: number) =>
      typeof x === "number" && x >= lo && x <= hi ? x : d;
    return {
      font: n(p.font, 11, 22, DEFAULT_PREFS.font),
      splitX: n(p.splitX, 0.2, 0.8, DEFAULT_PREFS.splitX),
      splitY: n(p.splitY, 0.2, 0.85, DEFAULT_PREFS.splitY),
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(p: WorkspacePrefs): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Quota or no storage: prefs just don't persist.
  }
}
