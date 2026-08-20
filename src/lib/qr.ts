/* A QR encoder, written out by hand.
 *
 * Linking a second device means handing it a URL, and a URL you have to retype
 * on a phone keyboard is a URL nobody links with — so, a QR code. Every library
 * that draws one is a runtime dependency, and this app has exactly two of those
 * on purpose. A few hundred lines of ISO/IEC 18004 is the cheaper price: the
 * code has to render with the tab open on a plane, same as everything else here.
 *
 * Deliberately partial. Byte mode only, error level M only, versions 1 to 10 —
 * no numeric, alphanumeric or kanji modes, no other correction levels, nothing
 * past version 10. The only thing this will ever encode is a link of roughly 80
 * to 150 bytes, which lands between versions 5 and 8 with room to spare; the
 * modes left out would not encode that link any smaller (a URL is mixed case, so
 * it is byte mode whatever you do), and level M already survives a thumbprint on
 * the glass. Anything that genuinely doesn't fit gets `null`, and the caller
 * falls back to showing the code as text.
 *
 * The phases below are the spec's own, in its order: payload to codewords,
 * Reed-Solomon, interleave, the fixed patterns, the data snake, then the eight
 * masks and the four penalty rules that pick between them. `scripts/qr-verify.mjs`
 * diffs every symbol here module-for-module against the npm `qrcode` package.
 */

/* `noUncheckedIndexedAccess` is on and every read below is in bounds by
   construction — the tables are fixed-size and the indices come from the field
   itself. Admitting that once here beats scattering `!` down the file. */
const at = (a: readonly number[], i: number): number => a[i] ?? 0;

/* -------------------------------- the tables ------------------------------- */

interface VersionSpec {
  /** Payload bytes that fit in byte mode at level M. */
  bytes: number;
  /** Error-correction codewords per block. */
  ec: number;
  /** [block count, data codewords per block] for each of the one or two groups. */
  groups: readonly (readonly [number, number])[];
  /** Row/column centres of the alignment patterns. Version 1 has none. */
  align: readonly number[];
}

/* Table 9 and Table E.1 of the spec, level M only, indexed by version - 1. The
   byte capacity is derivable from the rest, but it is the number the caller's
   payload is measured against every single call, so it is spelled out. */
const VERSIONS: readonly VersionSpec[] = [
  { bytes: 14, ec: 10, groups: [[1, 16]], align: [] },
  { bytes: 26, ec: 16, groups: [[1, 28]], align: [6, 18] },
  { bytes: 42, ec: 26, groups: [[1, 44]], align: [6, 22] },
  { bytes: 62, ec: 18, groups: [[2, 32]], align: [6, 26] },
  { bytes: 84, ec: 24, groups: [[2, 43]], align: [6, 30] },
  { bytes: 106, ec: 16, groups: [[4, 27]], align: [6, 34] },
  { bytes: 122, ec: 18, groups: [[4, 31]], align: [6, 22, 38] },
  { bytes: 152, ec: 22, groups: [[2, 38], [2, 39]], align: [6, 24, 42] },
  { bytes: 180, ec: 22, groups: [[3, 36], [2, 37]], align: [6, 26, 46] },
  { bytes: 213, ec: 26, groups: [[4, 43], [1, 44]], align: [6, 28, 50] },
];

/* --------------------------- GF(256) and Reed-Solomon ---------------------- */

/* Error correction is arithmetic in GF(256) under the QR field polynomial
   x^8 + x^4 + x^3 + x^2 + 1. Log and antilog tables turn every multiply into an
   addition, and they never depend on the payload, so they are built once. */
const EXP: number[] = new Array<number>(255);
const LOG: number[] = new Array<number>(256).fill(0);
for (let i = 0, x = 1; i < 255; i++) {
  EXP[i] = x;
  LOG[x] = i;
  x = x < 0x80 ? x << 1 : ((x << 1) ^ 0x11d) & 0xff;
}

const gfExp = (i: number): number => at(EXP, i % 255);
const gfMul = (a: number, b: number): number =>
  a === 0 || b === 0 ? 0 : gfExp(at(LOG, a) + at(LOG, b));

/* The generator for n error-correction codewords is (x-a^0)(x-a^1)…(x-a^(n-1)),
   multiplied out one root at a time. Coefficients run highest power first. */
function generator(degree: number): number[] {
  let poly: number[] = [1];
  for (let d = 0; d < degree; d++) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let i = 0; i < poly.length; i++) {
      const c = at(poly, i);
      next[i] = at(next, i) ^ c;
      next[i + 1] = at(next, i + 1) ^ gfMul(c, gfExp(d));
    }
    poly = next;
  }
  return poly;
}

/* Polynomial long division of one data block by that generator. What is left
   over is the block's error-correction codewords — the whole of the redundancy
   that lets a scanner read a symbol with a coffee ring on it. */
function remainder(block: readonly number[], count: number): number[] {
  const gen = generator(count);
  const rem = new Array<number>(count).fill(0);
  for (const word of block) {
    const factor = word ^ at(rem, 0);
    rem.shift();
    rem.push(0);
    if (factor === 0) continue;
    for (let i = 0; i < count; i++) rem[i] = at(rem, i) ^ gfMul(at(gen, i + 1), factor);
  }
  return rem;
}

/* --------------------------- payload to codewords -------------------------- */

const dataWords = (spec: VersionSpec): number =>
  spec.groups.reduce((n, [count, size]) => n + count * size, 0);

/* Mode indicator, length, the bytes, then the spec's padding ritual: up to four
   zero bits to terminate, zeros out to the next byte boundary, and 0xEC/0x11
   alternating until the version's data capacity is exactly full. A short payload
   in a big symbol is mostly that alternating pad, which is fine — it is what
   keeps every version's block geometry a constant. */
function codewords(bytes: Uint8Array, spec: VersionSpec, version: number): number[] {
  const need = dataWords(spec);
  const bits: number[] = [];
  const push = (value: number, length: number): void => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };

  push(0b0100, 4);
  /* The character count field widens from 8 bits to 16 at version 10. */
  push(bytes.length, version < 10 ? 8 : 16);
  for (const b of bytes) push(b, 8);

  for (let i = 0; i < 4 && bits.length < need * 8; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const words: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let w = 0;
    for (let j = 0; j < 8; j++) w = (w << 1) | at(bits, i + j);
    words.push(w);
  }
  for (let i = 0; words.length < need; i++) words.push(i % 2 === 0 ? 0xec : 0x11);
  return words;
}

/* Blocks are woven together — first codeword of every block, then the second,
   and so on, with all the correction codewords after all the data — so that a
   scratch across the symbol costs a few codewords in each block instead of
   destroying one block outright. Correction is per block; damage should be too. */
function interleave(data: readonly number[], spec: VersionSpec): number[] {
  const blocks: number[][] = [];
  const checks: number[][] = [];
  let off = 0;
  for (const [count, size] of spec.groups) {
    for (let b = 0; b < count; b++) {
      const block = data.slice(off, off + size);
      off += size;
      blocks.push(block);
      checks.push(remainder(block, spec.ec));
    }
  }

  const out: number[] = [];
  /* Groups differ by one codeword, so the short blocks simply drop out of the
     last round rather than padding it. */
  const longest = blocks.reduce((n, b) => Math.max(n, b.length), 0);
  for (let i = 0; i < longest; i++) {
    for (const b of blocks) {
      const word = b[i];
      if (word !== undefined) out.push(word);
    }
  }
  for (let i = 0; i < spec.ec; i++) for (const c of checks) out.push(at(c, i));
  return out;
}

/* --------------------------------- the grid -------------------------------- */

interface Grid {
  size: number;
  /** Row-major module colours. */
  dark: boolean[];
  /** Function patterns and the reserved format/version areas. These never carry
   *  data and are never masked, which is the only reason to track them. */
  fixed: boolean[];
}

const emptyGrid = (size: number): Grid => ({
  size,
  dark: new Array<boolean>(size * size).fill(false),
  fixed: new Array<boolean>(size * size).fill(false),
});

const get = (g: Grid, r: number, c: number): boolean => g.dark[r * g.size + c] === true;
const isFixed = (g: Grid, r: number, c: number): boolean => g.fixed[r * g.size + c] === true;
const put = (g: Grid, r: number, c: number, dark: boolean, fixed = false): void => {
  g.dark[r * g.size + c] = dark;
  if (fixed) g.fixed[r * g.size + c] = true;
};

/** The flat grid as the rows of booleans everyone outside this file wants. */
const rows = (g: Grid): boolean[][] =>
  Array.from({ length: g.size }, (_, r) =>
    Array.from({ length: g.size }, (_, c) => get(g, r, c))
  );

/* BCH(15,5) over the five bits of "level M, mask m", then a constant XOR so that
   an all-light format area can never read back as a valid one. Level M is 0b00,
   which is why only the mask goes in. */
function formatBits(mask: number): number {
  let rest = mask << 10;
  for (let i = 14; i >= 10; i--) if ((rest >> i) & 1) rest ^= 0x537 << (i - 10);
  return ((mask << 10) | rest) ^ 0x5412;
}

/* BCH(18,6) on the version number. Only versions 7 and up carry it; below that a
   scanner works the version out by counting modules across the symbol. */
function versionBits(version: number): number {
  let rest = version << 12;
  for (let i = 17; i >= 12; i--) if ((rest >> i) & 1) rest ^= 0x1f25 << (i - 12);
  return (version << 12) | rest;
}

/* Everything a scanner needs before it can read a single bit: the three finders
   and their light separators, the two timing lines that fix the module pitch,
   the alignment squares that let it undo perspective, and the one module that is
   dark in every QR code ever printed. Format and version areas are reserved with
   placeholder values — the format bits depend on which mask wins, so they get
   written later, but the data snake has to know to step around them now. */
function functionPatterns(g: Grid, spec: VersionSpec, version: number): void {
  const n = g.size;

  const finders: readonly (readonly [number, number])[] = [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ];
  for (const [row, col] of finders) {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= n || c < 0 || c >= n) continue;
        const inside = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const ring = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const core = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        put(g, r, c, inside && (ring || core), true);
      }
    }
  }

  for (let i = 8; i < n - 8; i++) {
    put(g, 6, i, i % 2 === 0, true);
    put(g, i, 6, i % 2 === 0, true);
  }

  for (const ar of spec.align) {
    for (const ac of spec.align) {
      /* The three centres that would land on a finder are simply not drawn. */
      if (ar === 6 && (ac === 6 || ac === n - 7)) continue;
      if (ac === 6 && ar === n - 7) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          put(g, ar + dr, ac + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1, true);
        }
      }
    }
  }

  for (let i = 0; i < 9; i++) {
    if (i === 6) continue;
    put(g, 8, i, false, true);
    put(g, i, 8, false, true);
  }
  for (let i = 0; i < 8; i++) put(g, 8, n - 1 - i, false, true);
  for (let i = 0; i < 7; i++) put(g, n - 1 - i, 8, false, true);
  put(g, n - 8, 8, true, true);

  if (version >= 7) {
    const bits = versionBits(version);
    for (let i = 0; i < 18; i++) {
      const on = ((bits >> i) & 1) === 1;
      const r = Math.floor(i / 3);
      const c = (i % 3) + n - 11;
      put(g, r, c, on, true);
      put(g, c, r, on, true);
    }
  }
}

/* The data snake: two columns at a time, right to left, alternating upward and
   downward, stepping over the vertical timing line at column 6. Wherever the
   codewords run out the modules stay light — those are the spec's remainder
   bits, and they get masked like any other data module. */
function placeData(g: Grid, words: readonly number[]): void {
  const n = g.size;
  let bit = 0;
  let upward = true;
  for (let right = n - 1; right > 0; right -= 2) {
    if (right === 6) right = 5;
    for (let step = 0; step < n; step++) {
      const r = upward ? n - 1 - step : step;
      for (const c of [right, right - 1]) {
        if (isFixed(g, r, c)) continue;
        const word = words[bit >> 3];
        put(g, r, c, word !== undefined && ((word >> (7 - (bit & 7))) & 1) === 1);
        bit++;
      }
    }
    upward = !upward;
  }
}

/* ---------------------------- masks and penalties -------------------------- */

/* Masking exists so that a payload of, say, all zeroes doesn't paint a huge
   blank region a scanner can't lock on to. All eight are tried; the penalty
   rules below decide. */
const MASKS: readonly ((r: number, c: number) => boolean)[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

/* A copy of the symbol with one mask applied and that mask's format bits
   written in both places. The fixed map is shared rather than copied: nothing
   from here on writes to it. */
function masked(g: Grid, mask: number, rule: (r: number, c: number) => boolean): Grid {
  const n = g.size;
  const out: Grid = { size: n, dark: g.dark.slice(), fixed: g.fixed };

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!isFixed(g, r, c) && rule(r, c)) put(out, r, c, !get(g, r, c));
    }
  }

  /* Fifteen bits, least significant first, up the left of the top-right finder
     and around the top-left one — then the same fifteen again in the mirror
     position, so losing a corner of the symbol doesn't lose the format. */
  const bits = formatBits(mask);
  for (let i = 0; i < 15; i++) {
    const on = ((bits >> i) & 1) === 1;
    if (i < 6) put(out, i, 8, on);
    else if (i < 8) put(out, i + 1, 8, on);
    else put(out, n - 15 + i, 8, on);

    if (i < 8) put(out, 8, n - 1 - i, on);
    else if (i === 8) put(out, 8, 7, on);
    else put(out, 8, 14 - i, on);
  }
  return out;
}

/* The four penalty rules, scored on the finished symbol — function patterns and
   format bits included, because that is what the scanner is looking at. Lowest
   total wins, ties to the lower mask number. */
function penalty(g: Grid): number {
  const n = g.size;
  let score = 0;

  /* N1 — runs of five or more of one colour along a line. The longer the run,
     the easier it is for a scanner sweeping across it to lose its place. */
  for (let a = 0; a < n; a++) {
    for (const byRow of [true, false]) {
      let run = 0;
      let last = false;
      for (let b = 0; b < n; b++) {
        const m = byRow ? get(g, a, b) : get(g, b, a);
        run = b > 0 && m === last ? run + 1 : 1;
        last = m;
        if (run === 5) score += 3;
        else if (run > 5) score += 1;
      }
    }
  }

  /* N2 — 2x2 blocks of one colour, which smear into each other on paper. */
  for (let r = 0; r < n - 1; r++) {
    for (let c = 0; c < n - 1; c++) {
      const m = get(g, r, c);
      if (m === get(g, r, c + 1) && m === get(g, r + 1, c) && m === get(g, r + 1, c + 1)) {
        score += 3;
      }
    }
  }

  /* N3 — the finder pattern's own 1:1:3:1:1 signature with four light modules
     beside it, appearing anywhere in the data. A scanner would take it for a
     fourth finder and lose the symbol's geometry, so it is the expensive one. */
  for (let a = 0; a < n; a++) {
    let row = 0;
    let col = 0;
    for (let b = 0; b < n; b++) {
      row = ((row << 1) & 0x7ff) | (get(g, a, b) ? 1 : 0);
      col = ((col << 1) & 0x7ff) | (get(g, b, a) ? 1 : 0);
      if (b < 10) continue;
      if (row === 0b10111010000 || row === 0b00001011101) score += 40;
      if (col === 0b10111010000 || col === 0b00001011101) score += 40;
    }
  }

  /* N4 — how far the dark/light balance strays from even, in five-percent
     steps. Read the spec's table literally: the step is the one *towards* 50%,
     so 52% dark scores nothing. Some encoders round the other way above the
     halfway line and so pick a different mask now and then; both symbols are
     legal and both scan. */
  let dark = 0;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (get(g, r, c)) dark++;
  score += Math.floor(Math.abs((dark * 100) / (n * n) - 50) / 5) * 10;

  return score;
}

/* ------------------------------ the public bit ----------------------------- */

/** Encode text as a QR module matrix (byte mode, error level M, version picked
 *  automatically from 1..10). Returns null when the payload doesn't fit, so the
 *  caller can fall back to showing the code as text.
 *
 *  Rows of booleans, true = dark, and no quiet zone — the renderer adds that.
 *
 *  `opts` is test-only: `scripts/qr-verify.mjs` pins the version and the mask so
 *  that all eight maskings of a payload can be diffed against a reference
 *  encoder. The app itself never passes it, and an out-of-range pin returns
 *  null rather than something almost right. */
export function qrMatrix(
  text: string,
  opts?: { version?: number; mask?: number }
): boolean[][] | null {
  const bytes = new TextEncoder().encode(text);

  /* Smallest version that holds the payload. `findIndex` returning -1 for "no
     version is big enough" lands on an undefined spec below, which is the same
     answer as an out-of-range pin: null. */
  const version = opts?.version ?? VERSIONS.findIndex((v) => v.bytes >= bytes.length) + 1;
  const spec = VERSIONS[version - 1];
  if (spec === undefined || bytes.length > spec.bytes) return null;

  const grid = emptyGrid(version * 4 + 17);
  functionPatterns(grid, spec, version);
  placeData(grid, interleave(codewords(bytes, spec, version), spec));

  let best: Grid | null = null;
  let bestScore = Infinity;
  for (const [m, rule] of MASKS.entries()) {
    if (opts?.mask !== undefined && opts.mask !== m) continue;
    const trial = masked(grid, m, rule);
    const score = penalty(trial);
    if (score < bestScore) {
      bestScore = score;
      best = trial;
    }
  }
  /* Only reachable from a mask pin outside 0..7 — nothing else can skip all
     eight. */
  if (best === null) return null;

  return rows(best);
}
