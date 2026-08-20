/* The link as a QR matrix. The `qrcode` package does the drawing; this file is
 * the seam it sits behind.
 *
 * Both halves of QR are bought now. `jsqr` turns a camera frame back into a
 * link over in `ScanOverlay`; `qrcode` turns a link into a symbol here. This
 * used to be a few hundred hand-written lines of ISO/IEC 18004, kept because
 * the app was counting its dependencies — it isn't any more, and encoding is
 * exactly the kind of frozen, well-served problem you take off the shelf.
 *
 * What survived the swap is the seam: one function, one shape, `boolean[][]`
 * or `null`. `QrCode` never learned that anything underneath it changed, and
 * nothing else in the app ever knew there was an encoder at all.
 *
 * The old limits went with the old code. The library picks any version from 1
 * to 40 and segments the payload however it likes, so a deep path or a long
 * origin is no longer a lost square, and `null` now means the library actually
 * refused rather than "past the tables I typed in".
 *
 * That the two libraries agree about a symbol is not assumed: the e2e suite
 * paints one of these matrices onto a fake camera and asserts jsQR reads the
 * link back out of it, which is the only property this app needs from either.
 */

import { create } from "qrcode";

/** Encode text as a QR module matrix at error level M. Rows of booleans,
 *  true = dark, and no quiet zone — the renderer adds that.
 *
 *  `null` when the library won't encode it, so the caller can fall back to
 *  showing the code as text. Every caller already prints it underneath. */
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
    /* One flat Uint8Array, row-major. `noUncheckedIndexedAccess` can't see
       that r and c are bounded by `size`, and a missing bit is a light one. */
    for (let c = 0; c < n; c++) row.push((modules.data[r * n + c] ?? 0) !== 0);
    rows.push(row);
  }
  return rows;
}
