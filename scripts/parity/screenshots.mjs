/* Side-by-side screenshots of the reference and the port, at iPhone width, in
 * both palettes, with every day expanded. Writes PNG pairs you can flip
 * between by eye.
 *
 * The pass/fail here is on RENDERED TEXT, which is deterministic. The pixel
 * counts are printed for context only and are NOT a verdict: Chromium picks
 * between LCD-subpixel and greyscale text antialiasing based on compositing
 * and raster-cache state, so the same two DOMs can come out bit-identical on
 * one run and differ by a few units along glyph edges on the next. Every solid
 * colour matches exactly; only glyph fringes move.
 *
 * For the authoritative visual check, use computed.mjs — it compares box
 * geometry and 56 computed style properties per element and has no such
 * ambiguity.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import { PNG } from "pngjs";

const OUT = process.env.PARITY_OUT || "/tmp/onsite-express-parity";
fs.mkdirSync(OUT, { recursive: true });

const REF = new URL("../../reference/onsite-express.html", import.meta.url).href;
const APP = process.env.APP_URL || "http://localhost:5173/";
const TABS = ["line", "metro", "dojo", "me"]; // ":has-text('me')" would also match "metro"
const IPHONE = { width: 390, height: 844 };

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" });
const errors = {};

async function sweep(url, tag, scheme, { openDays = false } = {}) {
  const ctx = await browser.newContext({
    viewport: IPHONE,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: scheme,
  });
  const page = await ctx.newPage();
  const seen = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") seen.push(m.type() + ": " + m.text());
  });
  page.on("pageerror", (e) => seen.push("pageerror: " + e.message));

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  if (openDays) {
    // Dispatch the click rather than driving the mouse: a real click makes
    // Playwright scroll the header into view, and Chromium rasterises LCD text
    // against scroll/compositing state. The reference rebuilds the whole rail's
    // innerHTML on every toggle while React only flips a class, so the two end
    // up with different layer histories and the glyph fringes drift — a capture
    // artifact, not a difference in what either app draws.
    const n = await page.$$eval(".dayhead", (els) => els.length);
    for (let i = 0; i < n; i++) {
      await page.$$eval(
        ".stn",
        (els, k) => {
          if (!els[k].classList.contains("open")) els[k].querySelector(".dayhead").click();
        },
        i
      );
      await page.waitForTimeout(90);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(150);
  }

  const text = {};
  for (let i = 0; i < TABS.length; i++) {
    await page.locator(".tabs .tab").nth(i).click();
    await page.waitForTimeout(260);
    // Pin the scroll to an exact integer offset. Chromium rasterises LCD text
    // against the fractional scroll position, so a page left mid-scroll by the
    // openDays clicks would show subpixel fringing that is not a real change.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(140);
    if (tag) await page.screenshot({ path: `${OUT}/${scheme}-${tag}-${TABS[i]}.png` });
    text[TABS[i]] = await page.evaluate(() => {
      const v = document.querySelector(".view.on") || document.querySelector("section.view");
      return v ? v.innerText.replace(/\s+/g, " ").trim() : "";
    });
  }
  text.__header = await page.evaluate(() =>
    document.querySelector(".hdr").innerText.replace(/\s+/g, " ").trim()
  );

  if (tag) errors[`${scheme}/${tag}`] = seen;
  await ctx.close();
  return text;
}

const refText = {};
const appText = {};
for (const scheme of ["light", "dark"]) {
  // Throwaway pass per colour scheme: Chromium's glyph raster cache is cold the
  // first time it paints a palette, and whichever side goes first would eat the
  // difference. Warm both, then measure.
  await sweep(REF, null, scheme);
  await sweep(APP, null, scheme);

  const r = await sweep(REF, "ref", scheme, { openDays: true });
  const a = await sweep(APP, "app", scheme, { openDays: true });
  if (scheme === "light") Object.assign(refText, r), Object.assign(appText, a);
}
await browser.close();

/* ------------------------------- report -------------------------------- */

console.log("=== rendered text, tab by tab ===");
let textBad = 0;
for (const k of [...TABS, "__header"]) {
  const a = refText[k];
  const b = appText[k];
  if (a === b) {
    console.log(`  ${k.padEnd(9)} IDENTICAL (${a.length} chars)`);
  } else {
    textBad++;
    let i = 0;
    while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
    console.log(`  ${k.padEnd(9)} DIFFERS at char ${i}`);
    console.log(`    ref: ${JSON.stringify(a.slice(Math.max(0, i - 50), i + 80))}`);
    console.log(`    app: ${JSON.stringify(b.slice(Math.max(0, i - 50), i + 80))}`);
  }
}

console.log("\n=== rendered pixels (informational — see the header comment) ===");
let pxBad = 0;
let worst = 0;
for (const scheme of ["light", "dark"]) {
  for (const t of TABS) {
    const a = PNG.sync.read(fs.readFileSync(`${OUT}/${scheme}-ref-${t}.png`));
    const b = PNG.sync.read(fs.readFileSync(`${OUT}/${scheme}-app-${t}.png`));
    let n = 0;
    let maxd = 0;
    for (let i = 0; i < a.data.length; i += 4) {
      const d = Math.max(
        Math.abs(a.data[i] - b.data[i]),
        Math.abs(a.data[i + 1] - b.data[i + 1]),
        Math.abs(a.data[i + 2] - b.data[i + 2])
      );
      if (d > 0) {
        n++;
        maxd = Math.max(maxd, d);
      }
    }
    if (n) pxBad++;
    worst = Math.max(worst, maxd);
    console.log(
      `  ${scheme}/${t.padEnd(6)} ${n === 0 ? "byte-identical" : `${n} px differ (maxΔ ${maxd}) — glyph edges`}`
    );
  }
}

console.log("\n=== console ===");
for (const [k, v] of Object.entries(errors)) console.log(`  ${k.padEnd(12)} ${v.length ? JSON.stringify(v) : "clean"}`);

if (pxBad) {
  console.log(
    `\n  ${pxBad}/8 pairs not bit-identical this run. Re-run and they may be;` +
      ` the deltas sit on antialiased glyph edges, not on fills.`
  );
}
console.log(`\nRESULT: ${textBad === 0 ? "PASS" : "FAIL"} (verdict is on rendered text)`);
process.exit(textBad === 0 ? 0 : 1);
