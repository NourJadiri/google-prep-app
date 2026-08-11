/* Persistence. localStorage when the browser allows it, an in-memory shim when
   it doesn't (private windows, cookie-blocked embeds) so nothing ever throws
   its way up into React. */

export const KEY = "onsite-express-v1";
const DEBOUNCE_MS = 350;

let mode = "mem";
let memValue = null;
let timer = null;
let pending = null;

function probe() {
  try {
    const t = "__oe_probe";
    localStorage.setItem(t, "1");
    localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

/* Called once on boot. Returns the raw parsed blob, or null for a fresh line. */
export function load() {
  if (!probe()) {
    mode = "mem";
    return memValue;
  }
  mode = "local";
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Corrupt payload: start fresh, but stay in local mode so the next save
    // overwrites the bad blob instead of silently downgrading to memory.
    return null;
  }
}

export function persist(state) {
  if (mode === "local") {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return;
    } catch {
      // Quota or a mid-session permission change — fall through to memory.
    }
  }
  memValue = state;
}

export function save(state) {
  pending = state;
  clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    pending = null;
    persist(state);
  }, DEBOUNCE_MS);
}

/* iOS discards backgrounded tabs without warning; don't lose the last 350ms. */
export function flush() {
  if (timer === null) return;
  clearTimeout(timer);
  timer = null;
  const s = pending;
  pending = null;
  if (s) persist(s);
}

export function storageMode() {
  return mode;
}

export function storeNote() {
  return mode === "local"
    ? "Progress saves in this browser (localStorage). Export to move it between devices."
    : "Storage isn't available here, so progress lives only in this session — export before closing.";
}
