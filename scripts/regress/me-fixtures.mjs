// me-fixtures.mjs: the data the Me suite feeds the app, and the camera it points at a QR code.
//
// The blobs are written out by hand, in the shape engine.normalize() returns, so that
// normalize(blob) deep-equals blob: what the app exports, imports and syncs can then be
// compared with the fixture itself. Problem ids are the app's own (plan.ts / aws.ts).

import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const TS = 1_772_000_000_000; // an arbitrary March 2026 stamp for "when it was awarded"
const at = (n) => TS + n * 3_600_000;
const flags = (ids) => Object.fromEntries(ids.map((id) => [id, true]));

/* The Google line, days 1-5 ridden and a start on day 6; the Local barely begun.
   1240 XP is "Pattern Oracle", the sixth rung of ten: a ladder with checks above the
   marker and dim dots below it. */
export const SEED = {
  v: 2,
  track: "google",
  tracks: {
    google: {
      xp: 1240,
      done: flags(["ap", "btp", "ps2", "lsw", "sub", "perm", "cs2", "kls", "lcp", "pp", "nq", "tkf", "cs", "mccs", "wb", "kla", "hr2", "cc", "lis", "trie", "up", "mps"]),
      rituals: { d1: "2026-03-01", d2: "2026-03-02", d3: "2026-03-03", d4: "2026-03-05", d5: "2026-03-06" },
      accepted: { ap: at(3), btp: at(5), cs: at(40) },
    },
    aws: {
      xp: 70,
      done: flags(["contains-duplicate", "two-sum", "valid-anagram"]),
      rituals: {},
      accepted: { "two-sum": at(60) },
    },
  },
  quiz: {
    answered: 134,
    correct: 101,
    perQ: { q1: { seen: 3, right: 2 }, q2: { seen: 5, right: 5 }, q14: { seen: 2, right: 0 } },
    missed: [],
    bestStreak: 8,
    sessions: 14,
    perfect: 1,
    bugRight: 12,
  },
  badges: { first: at(1), ritual5: at(20), metro100: at(30), streak3: at(31), aws1: at(55) },
  streak: { last: "2026-03-09", cur: 4, best: 6 },
};

/* The same person, riding the Local: the third tile counts problems passed in the
   editor instead of rituals, and the ladder is the Local's. */
export const SEED_AWS = {
  ...SEED,
  track: "aws",
  tracks: {
    ...SEED.tracks,
    aws: {
      xp: 150,
      done: flags(["contains-duplicate", "two-sum", "valid-anagram", "majority-element", "valid-palindrome", "longest-common-prefix", "roman-to-integer", "move-zeroes"]),
      rituals: {},
      accepted: { "two-sum": at(60), "valid-anagram": at(61), "valid-palindrome": at(62) },
    },
  },
};

/* A different, smaller history: the "other device" in the join and link scenarios. */
export const SEED_B = {
  v: 2,
  track: "google",
  tracks: {
    google: { xp: 480, done: flags(["ap", "btp", "ps2", "lsw", "sub", "perm", "cs2", "kls"]), rituals: { d1: "2026-03-07", d2: "2026-03-08" }, accepted: { ap: at(70) } },
    aws: { xp: 0, done: {}, rituals: {}, accepted: {} },
  },
  quiz: { answered: 40, correct: 28, perQ: { q3: { seen: 1, right: 1 } }, missed: [], bestStreak: 5, sessions: 4, perfect: 0, bugRight: 3 },
  badges: { first: at(71) },
  streak: { last: "2026-03-08", cur: 2, best: 3 },
};

/* A third history, for the second edit in the last-write-wins scenarios. */
export const SEED_C = {
  ...SEED_B,
  tracks: { ...SEED_B.tracks, google: { ...SEED_B.tracks.google, xp: 710, done: { ...SEED_B.tracks.google.done, ...flags(["lcp", "pp"]) } } },
  quiz: { ...SEED_B.quiz, answered: 55, correct: 40 },
};

/* The progress file of the original single-file app (export format v1): xp, done and
   rituals at the top level, which upgrade into the Google line on import. */
export const LEGACY_V1 = {
  v: 1,
  xp: 215,
  done: flags(["ap", "btp", "ps2", "lsw", "sub"]),
  rituals: { d1: "2026-03-01", d2: "2026-03-02" },
  quiz: { answered: 12, correct: 9, perQ: { q1: { seen: 1, right: 1 } }, missed: [], bestStreak: 3, sessions: 1, perfect: 0, bugRight: 2 },
  badges: { first: at(2) },
  streak: { last: "2026-03-02", cur: 2, best: 2 },
};

/* What import turns LEGACY_V1 into. */
export const LEGACY_V1_UPGRADED = {
  v: 2,
  track: "google",
  tracks: {
    google: { xp: 215, done: LEGACY_V1.done, rituals: LEGACY_V1.rituals, accepted: {} },
    aws: { xp: 0, done: {}, rituals: {}, accepted: {} },
  },
  quiz: LEGACY_V1.quiz,
  badges: LEGACY_V1.badges,
  streak: LEGACY_V1.streak,
};

export const BLANK = {
  v: 2,
  track: "google",
  tracks: {
    google: { xp: 0, done: {}, rituals: {}, accepted: {} },
    aws: { xp: 0, done: {}, rituals: {}, accepted: {} },
  },
  quiz: { answered: 0, correct: 0, perQ: {}, missed: [], bestStreak: 0, sessions: 0, perfect: 0, bugRight: 0 },
  badges: {},
  streak: { last: "", cur: 0, best: 0 },
};

/* An export from a build that does not exist yet: the Worker stores it (it only reads `v`),
   the app cannot read it. */
export const FUTURE = { v: 3, track: "google", tracks: {}, note: "written by a newer build" };

/* ------------------------------ the QR, in pixels ------------------------------ */

/* The module matrix of `text`, from the same package the app draws with, at the same
   error level. Used both to check the square the app paints and to paint one for the
   fake camera, so the two are independent of the app's own qrMatrix.ts. */
export function qrModules(text) {
  const { create } = require("qrcode");
  const { modules } = create(text, { errorCorrectionLevel: "M" });
  const n = modules.size;
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => modules.data[r * n + c] !== 0));
}

/* A Y4M clip (what --use-file-for-fake-video-capture plays, looped) of a camera held
   in front of a screen showing `text` as a QR code: dark modules on a light card, a
   mid-grey room around it. With no text, just the room. */
export function writeQrClip(file, text, { width = 640, height = 480, scale = 10, frames = 5 } = {}) {
  const luma = Buffer.alloc(width * height, 120);
  if (text) {
    const quiet = 4;
    const m = qrModules(text);
    const n = m.length;
    const side = (n + quiet * 2) * scale;
    const ox = Math.floor((width - side) / 2);
    const oy = Math.floor((height - side) / 2);
    for (let y = oy; y < oy + side; y++) {
      for (let x = ox; x < ox + side; x++) {
        const mr = Math.floor((y - oy) / scale) - quiet;
        const mc = Math.floor((x - ox) / scale) - quiet;
        luma[y * width + x] = mr >= 0 && mc >= 0 && mr < n && mc < n && m[mr][mc] ? 24 : 232;
      }
    }
  }
  const chroma = Buffer.alloc((width * height) / 4, 128);
  const frame = Buffer.concat([Buffer.from("FRAME\n"), luma, chroma, chroma]);
  const header = Buffer.from(`YUV4MPEG2 W${width} H${height} F10:1 Ip A1:1 C420jpeg\n`);
  fs.writeFileSync(file, Buffer.concat([header, ...Array.from({ length: frames }, () => frame)]));
}

/* jsQR's browser build, injected into the page so a stand-in BarcodeDetector can use it. */
export const JSQR_SOURCE = fs.readFileSync(require.resolve("jsqr"), "utf8");
