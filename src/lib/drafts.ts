// Kept apart from the progress blob: drafts change on every keystroke and must never sync or export.
const KEY = "onsite-express-code-v1";
const PREFS_KEY = "onsite-express-workspace-v1";

interface Draft {
  code: string;
  at: number;
}

let mem: Record<string, Draft> = {};

function readAll(): Record<string, Draft> {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Record<string, Draft>) : {};
  } catch {
    return mem;
  }
}

function writeAll(all: Record<string, Draft>): void {
  mem = all;
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Quota or no storage: the draft lives as long as the tab.
  }
}

export function loadDraft(id: string): string | null {
  const d = readAll()[id];
  return d && typeof d.code === "string" ? d.code : null;
}

export function saveDraft(id: string, code: string): void {
  const all = readAll();
  all[id] = { code, at: Date.now() };
  writeAll(all);
}

export function clearDraft(id: string): void {
  const all = readAll();
  if (!(id in all)) return;
  delete all[id];
  writeAll(all);
}

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
    const raw = localStorage.getItem(PREFS_KEY);
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
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    // Quota or no storage: prefs just don't persist.
  }
}
