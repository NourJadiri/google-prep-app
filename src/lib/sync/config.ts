import { isSyncCode } from "../syncCode";

const CFG_KEY = "onsite-express-sync-v1";

export interface SyncConfig {
  code: string;
  /** Stamp of the newest local edit or adopted copy; above serverAt it is the dirty flag. */
  editedAt: number;
  /** Newest stamp the server acknowledged as ours. */
  serverAt: number;
  /** Last successful exchange. */
  okAt: number;
  /** Between "connect with a code" and first contact: the cloud copy wins even if this device edits first. */
  joining?: true;
}

export const isDirty = (cfg: SyncConfig): boolean => cfg.editedAt > cfg.serverAt;

/** Never goes backwards, so a clock step can't resurrect old data. */
export const stamp = (prev: number): number => Math.max(Date.now(), prev + 1);

export const freshConfig = (code: string, editedAt = 0): SyncConfig => ({ code, editedAt, serverAt: 0, okAt: 0 });

export function loadConfig(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(CFG_KEY);
    if (!raw) return null;
    const c: unknown = JSON.parse(raw);
    if (!c || typeof c !== "object") return null;
    const { code, editedAt, serverAt, okAt, joining } = c as Record<string, unknown>;
    if (typeof code !== "string" || !isSyncCode(code)) return null;
    const num = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : 0);
    return {
      code,
      editedAt: num(editedAt),
      serverAt: num(serverAt),
      okAt: num(okAt),
      ...(joining === true ? { joining: true as const } : {}),
    };
  } catch {
    return null;
  }
}

export function saveConfig(cfg: SyncConfig | null): void {
  try {
    if (cfg) localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
    else localStorage.removeItem(CFG_KEY);
  } catch {
    /* No storage here: sync still works, it just won't survive a reload. */
  }
}
