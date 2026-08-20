/* Proof that src/lib/qr.ts is a QR encoder and not merely a plausible one.
 *
 * Every symbol it draws is diffed module for module against the npm `qrcode`
 * package — the one half the internet's QR codes come out of. Bit-identity is
 * the bar: not "it scanned on my phone", which only proves the payload survived
 * whatever the encoder happened to do.
 *
 * Like the parity harness, the reference is installed on demand and never lands
 * in package.json. Two runtime dependencies is the whole point of the app; the
 * tools that check it are not among them.
 *
 *   npm install --no-save --no-package-lock qrcode && node scripts/qr-verify.mjs
 *
 * The encoder is TypeScript, so this bundles it first with the esbuild vite
 * already brought along and imports the bundle. QR_BUNDLE overrides where that
 * lands (default: a file in the OS temp directory).
 *
 * Three checks per payload, over every version 1..10 at three payload lengths:
 *
 *   version pick   our automatic version equals the reference's        (fatal)
 *   forced masks   all 8 maskings, both sides pinned, module-identical (fatal)
 *   auto mask      our chosen mask equals the reference's chosen mask  (warns)
 *
 * The last one only warns. The mask is a judgement call scored by four penalty
 * rules, the rules disagree by a hair between implementations at the >50%-dark
 * boundary, and every legal mask scans. The forced-mask check is what proves the
 * encoder; the auto check just says which way the judgement went.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BUNDLE = process.env.QR_BUNDLE || path.join(os.tmpdir(), "onsite-express-qr.mjs");

const built = spawnSync(path.join(ROOT, "node_modules/.bin/esbuild"), [
  "src/lib/qr.ts",
  "--bundle",
  "--format=esm",
  "--outfile=" + BUNDLE,
], { cwd: ROOT, stdio: ["ignore", "inherit", "inherit"] });

if (built.status !== 0) {
  console.error("esbuild failed — run `npm install` first.");
  process.exit(1);
}

const { qrMatrix } = await import(pathToFileURL(BUNDLE).href);

let QRCode;
try {
  const mod = await import("qrcode");
  QRCode = mod.default ?? mod;
} catch {
  console.error("The reference encoder is not installed. Run:\n" +
    "  npm install --no-save --no-package-lock qrcode");
  process.exit(1);
}

/* -------------------------------- the corpus ------------------------------- */

/* Byte capacity at level M, versions 1..10 — the same table the encoder holds,
   restated here so a typo in one is a failure rather than a shared assumption. */
const CAPACITY = [14, 26, 42, 62, 84, 106, 122, 152, 180, 213];

const GLYPHS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~:/?#[]@!$&'()*+,;=%";

/* URL-ish, mixed case, ASCII only so byte length is string length. Deterministic
   from the seed, so a reported failure is reproducible verbatim. */
function payload(n, seed) {
  const head = "https://onsite.express/l#";
  let out = head.slice(0, Math.min(head.length, n));
  let x = (seed * 2654435761) % 4294967291 || 1;
  while (out.length < n) {
    x ^= (x << 13) & 0xffffffff;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= (x << 5) & 0xffffffff;
    x >>>= 0;
    out += GLYPHS[x % GLYPHS.length];
  }
  return out;
}

/* One byte, about half full, and exactly full. The first fills a large symbol
   almost entirely with pad codewords; the last leaves no room for even the
   terminator, which is where an off-by-one in the padding shows up. */
const lengths = (v) => [1, Math.max(1, Math.floor(CAPACITY[v - 1] / 2)), CAPACITY[v - 1]];

/* ------------------------------- the reference ----------------------------- */

/* Forcing byte mode with an explicit segment: handed a bare string the reference
   would happily pick numeric or alphanumeric mode and encode something the byte
   encoder here never would. */
const segments = (text) => [{ data: text, mode: "byte" }];

function reference(text, version, mask) {
  const opts = { errorCorrectionLevel: "M" };
  if (version !== undefined) opts.version = version;
  if (mask !== undefined) opts.maskPattern = mask;

  const symbol = QRCode.create(segments(text), opts);
  const bits = symbol.modules;
  const n = bits.size;
  /* The BitMatrix has grown accessors over the years; take whichever is here. */
  const read =
    typeof bits.get === "function"
      ? (r, c) => Boolean(bits.get(r, c))
      : (r, c) => Boolean(bits.data[r * n + c]);

  const modules = [];
  for (let r = 0; r < n; r++) {
    const row = [];
    for (let c = 0; c < n; c++) row.push(read(r, c));
    modules.push(row);
  }
  return { modules, version: symbol.version, mask: symbol.maskPattern };
}

/* -------------------------------- the diffing ------------------------------ */

function firstDifference(ours, theirs) {
  if (ours.length !== theirs.length) {
    return `size ${ours.length} vs ${theirs.length}`;
  }
  for (let r = 0; r < ours.length; r++) {
    for (let c = 0; c < ours.length; c++) {
      if (ours[r][c] !== theirs[r][c]) {
        const shade = (b) => (b ? "dark" : "light");
        return `module (${r},${c}): ours ${shade(ours[r][c])}, reference ${shade(theirs[r][c])}`;
      }
    }
  }
  return null;
}

const failures = [];
const warnings = [];
let comparisons = 0;

function compare(ours, theirs, where) {
  comparisons++;
  if (ours === null) {
    failures.push(`${where}: our encoder returned null`);
    return;
  }
  const diff = firstDifference(ours, theirs);
  if (diff !== null) failures.push(`${where}: ${diff}`);
}

/* ---------------------------------- the run -------------------------------- */

for (let v = 1; v <= 10; v++) {
  for (const len of lengths(v)) {
    const text = payload(len, v * 101 + len);
    const where = (what) => `v${v} ${what} · ${len} byte${len === 1 ? "" : "s"}`;

    /* Every mask, both sides pinned to the same version and mask. This is the
       check that has to be perfect: it isolates the encoding from the judgement
       call about which mask is prettiest. */
    for (let m = 0; m < 8; m++) {
      compare(qrMatrix(text, { version: v, mask: m }), reference(text, v, m).modules,
        where(`mask ${m}`));
    }

    /* The happy path, zero config: our version, our mask, nothing pinned. */
    const auto = qrMatrix(text);
    if (auto === null) {
      failures.push(`${where("auto")}: our encoder returned null`);
      continue;
    }

    const ourVersion = (auto.length - 17) / 4;
    const theirAuto = reference(text, undefined, undefined);
    comparisons++;
    if (ourVersion !== theirAuto.version) {
      failures.push(
        `${where("auto version")}: ours v${ourVersion}, reference v${theirAuto.version}`
      );
      continue;
    }

    /* Which of the eight our automatic path settled on — the one whose pinned
       symbol it reproduces exactly. That it reproduces one of them at all is
       itself worth asserting. */
    let ourMask = null;
    for (let m = 0; m < 8 && ourMask === null; m++) {
      if (firstDifference(auto, qrMatrix(text, { version: ourVersion, mask: m })) === null) {
        ourMask = m;
      }
    }
    if (ourMask === null) {
      failures.push(`${where("auto")}: the automatic symbol matches none of the 8 maskings`);
      continue;
    }

    compare(auto, reference(text, ourVersion, ourMask).modules,
      `${where("auto")} (v${ourVersion}, mask ${ourMask})`);

    if (ourMask !== theirAuto.mask) {
      warnings.push(
        `${where("auto mask")}: ours ${ourMask}, reference ${theirAuto.mask} — both legal`
      );
    }
  }
}

/* --------------------------------- the verdict ----------------------------- */

for (const warning of warnings) console.warn("warn  " + warning);

if (failures.length > 0) {
  for (const failure of failures) console.error("FAIL  " + failure);
  console.error(`\nqr-verify: ${failures.length} of ${comparisons} comparisons differ.`);
  process.exit(1);
}

const agreed = 30 - warnings.length;
console.log(
  `qr-verify: ${comparisons} comparisons across versions 1-10 (30 payloads x 8 forced ` +
  `masks + auto version + auto symbol) — every module identical to the reference. ` +
  `Auto mask agreed ${agreed}/30.`
);
