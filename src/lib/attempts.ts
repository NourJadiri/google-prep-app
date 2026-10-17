// Which problems have had a failed run on this device. Local only, like drafts: a one-shot is about you at this keyboard.
const KEY = "onsite-express-misses-v1";

let mem: string[] = [];

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return mem;
  }
}

export const hasMissed = (id: string): boolean => read().includes(id);

export function markMissed(id: string): void {
  const all = read();
  if (all.includes(id)) return;
  mem = [...all, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(mem));
  } catch {
    // No storage: remembered for as long as the tab lives.
  }
}
