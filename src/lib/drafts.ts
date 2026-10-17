// Kept apart from the progress blob: drafts change on every keystroke and must never sync or export.
const KEY = "onsite-express-code-v1";

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
