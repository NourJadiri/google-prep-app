import { create } from "qrcode";

/** Encode text as a QR module matrix at error level M: rows of booleans, true = dark, no quiet zone (the renderer adds that).
 *  `null` when the library won't encode it, so the caller can fall back to showing the code as text. */
export function qrMatrix(text: string): boolean[][] | null {
  let modules;
  try {
    ({ modules } = create(text, { errorCorrectionLevel: "M" }));
  } catch {
    /* Past version 40's capacity, or an input the library won't segment. */
    return null;
  }
  const n = modules.size;
  const rows: boolean[][] = [];
  for (let r = 0; r < n; r++) {
    const row: boolean[] = [];
    /* One flat Uint8Array, row-major; `noUncheckedIndexedAccess` can't see that r and c are bounded by `size`, and a missing bit is a light one. */
    for (let c = 0; c < n; c++) row.push((modules.data[r * n + c] ?? 0) !== 0);
    rows.push(row);
  }
  return rows;
}
