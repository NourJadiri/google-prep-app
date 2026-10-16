/* The assistant's two things to remember, in this browser only.
 *
 * The password is what the Worker's /api/assistant checks before it spends
 * anything; it never syncs and never lands in an export, like a draft. The
 * spot is where the floating window was left, so it comes back there. Same
 * never-throw contract as drafts.ts: no storage just means asking again. */

const KEY = "onsite-express-assistant-v1";

export interface Spot {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Saved {
  password?: string;
  spot?: Spot;
}

let mem: Saved = {};

function read(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Saved) : {};
  } catch {
    return mem;
  }
}

function write(next: Saved): void {
  mem = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* No storage: remembered for as long as the tab lives. */
  }
}

export function loadPassword(): string | null {
  const p = read().password;
  return typeof p === "string" && p ? p : null;
}

export function savePassword(password: string): void {
  write({ ...read(), password });
}

export function forgetPassword(): void {
  const next = read();
  delete next.password;
  write(next);
}

export function loadSpot(): Spot | null {
  const s = read().spot;
  const ok = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
  return s && ok(s.x) && ok(s.y) && ok(s.w) && ok(s.h) ? s : null;
}

export function saveSpot(spot: Spot): void {
  write({ ...read(), spot });
}
