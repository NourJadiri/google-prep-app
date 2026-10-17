/* One arc for both cloud states, so only the mark underneath changes. */
const CLOUD_ARC = <path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24" />;

export const SYNC_GLYPHS = {
  "cloud-check": (
    <>
      {CLOUD_ARC}
      <path d="m8.5 17 2.5 2.5 4.5-4.5" />
    </>
  ),
  "cloud-upload": (
    <>
      {CLOUD_ARC}
      <path d="M12 21v-8" />
      <path d="m8.5 16.5 3.5-3.5 3.5 3.5" />
    </>
  ),
  "cloud-off": (
    <>
      <path d="m2 2 20 20" />
      <path d="M5.78 5.78A7 7 0 0 0 9 19h8.5a4.4 4.4 0 0 0 1.3-.19" />
      <path d="M21.53 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7 7 0 0 0 10 5.07" />
    </>
  ),
  "qr-code": (
    <>
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M21 12v.01" />
      <path d="M12 21v.01" />
      <path d="M16 12h1" />
    </>
  ),
};
