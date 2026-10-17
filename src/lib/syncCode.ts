/* Mirrors the Worker's rule, so a typo fails here rather than with a 400. */
const SYNC_CODE = /^[A-Za-z0-9][A-Za-z0-9._-]{7,63}$/;

export const isSyncCode = (text: string): boolean => SYNC_CODE.test(text);

/** Mints a code without enabling sync; the receive flow shows it as a QR and syncs only once another device seeds it. */
export function mintCode(): string {
  try {
    if (crypto.randomUUID) return crypto.randomUUID();
    const b = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  } catch {
    /* No crypto (ancient embed): a weak code beats no sync. */
    return `oe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
