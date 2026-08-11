/* Definition-of-done check: build real progress in the reference app, export
   it, import it into the port, and compare every tab. */
import { chromium } from "playwright";

const REF = new URL("../../reference/onsite-express.html", import.meta.url).href;
const APP = process.env.APP_URL || "http://localhost:5173/";
const TABS = ["Line", "Metro", "Dojo", "Me"];
const TAB_IDX = { Line: 0, Metro: 1, Dojo: 2, Me: 3 }; // ":has-text('Me')" also matches "Metro"

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" });

async function open(url) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    colorScheme: "light",
    permissions: [],
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  return { ctx, page, errors };
}

const tab = async (page, name) => {
  await page.locator(".tabs .tab").nth(TAB_IDX[name]).click();
  await page.waitForTimeout(220);
};

/* Reference re-renders innerHTML on every action, so re-query, never reuse handles. */
async function buildProgress(page) {
  await tab(page, "Line");

  // Day 1 is open by default: tick three problems and log the ritual.
  for (let i = 0; i < 3; i++) {
    await page.locator(".stn").nth(0).locator(".prow .pcheck").nth(i).click();
    await page.waitForTimeout(140);
  }
  await page.locator(".stn").nth(0).locator(".ritual").click();
  await page.waitForTimeout(140);

  // Open Day 2 and clear it outright, so a station falls and the focus moves.
  await page.locator(".stn").nth(1).locator(".dayhead").click();
  await page.waitForTimeout(140);
  for (let i = 0; i < 4; i++) {
    await page.locator(".stn").nth(1).locator(".prow .pcheck").nth(i).click();
    await page.waitForTimeout(140);
  }

  // A full metro run, always tapping slot A — a natural mix of right and wrong.
  await tab(page, "Metro");
  await page.click(".board");
  await page.waitForTimeout(250);
  for (let k = 0; k < 10; k++) {
    await page.locator(".opt").nth(0).click();
    await page.waitForTimeout(180);
    await page.click(".next");
    await page.waitForTimeout(180);
  }
  await page.click('.mbtn:has-text("Decks")');
  await page.waitForTimeout(200);
}

async function exportJSON(page) {
  await tab(page, "Me");
  await page.click('.mbtn:has-text("Export progress")');
  await page.waitForTimeout(250);
  return page.inputValue(".io");
}

async function importJSON(page, json) {
  await tab(page, "Me");
  await page.click('.mbtn:has-text("Import")'); // first press opens the box
  await page.waitForTimeout(200);
  await page.fill(".io", json);
  await page.waitForTimeout(100);
  await page.click('.mbtn:has-text("Import")');
  await page.waitForTimeout(350);
}

/* Which days happen to be expanded is deliberately not part of the export
   schema, so normalise it before comparing rendered text. */
async function expandAll(page) {
  const n = await page.$$eval(".dayhead", (els) => els.length);
  for (let i = 0; i < n; i++) {
    const open = await page.$$eval(".stn", (els, k) => els[k].classList.contains("open"), i);
    if (!open) await page.locator(".dayhead").nth(i).click();
    await page.waitForTimeout(90);
  }
}

async function snapshot(page) {
  const out = {};
  for (const t of TABS) {
    await tab(page, t);
    if (t === "Line") await expandAll(page);
    out[t] = await page.evaluate(() => {
      const v = document.querySelector(".view.on") || document.querySelector("section.view");
      return v ? v.innerText.replace(/\s+/g, " ").trim() : "";
    });
  }
  out.header = await page.evaluate(() =>
    document.querySelector(".hdr").innerText.replace(/\s+/g, " ").trim()
  );
  return out;
}

/* ---------------------------------------------------------------- */

const ref = await open(REF);
await buildProgress(ref.page);
const exported = await exportJSON(ref.page);
const refState = JSON.parse(exported);
console.log("reference export:", JSON.stringify(refState).slice(0, 220) + " …");
console.log(
  `  xp=${refState.xp} done=${Object.keys(refState.done).length} rituals=${Object.keys(refState.rituals).length}` +
    ` answered=${refState.quiz.answered} correct=${refState.quiz.correct} missed=${refState.quiz.missed.length}` +
    ` badges=${Object.keys(refState.badges).length}`
);
if (refState.quiz.answered !== 10) throw new Error("expected a full 10-card run in the reference");

const refSnap = await snapshot(ref.page);

const app = await open(APP);
await importJSON(app.page, exported);
const appSnap = await snapshot(app.page);

console.log("\n=== imported state renders the same? ===");
let bad = 0;
for (const k of [...TABS, "header"]) {
  if (refSnap[k] === appSnap[k]) {
    console.log(`  ${k}: IDENTICAL (${refSnap[k].length} chars)`);
  } else {
    bad++;
    let i = 0;
    const a = refSnap[k];
    const b = appSnap[k];
    while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
    console.log(`  ${k}: DIFFERS at ${i}`);
    console.log(`    ref: ${JSON.stringify(a.slice(Math.max(0, i - 50), i + 80))}`);
    console.log(`    app: ${JSON.stringify(b.slice(Math.max(0, i - 50), i + 80))}`);
  }
}

/* Re-export from the port and compare the payload itself. */
const reExported = await exportJSON(app.page);
const appState = JSON.parse(reExported);
const same = JSON.stringify(refState) === JSON.stringify(appState);
console.log("\nre-export byte-identical to the reference export:", same);
if (!same) {
  console.log("  ref:", JSON.stringify(refState));
  console.log("  app:", JSON.stringify(appState));
}

/* Persistence: reload and confirm it came back. */
await app.page.reload({ waitUntil: "networkidle" });
await app.page.waitForTimeout(500);
const afterReload = await snapshot(app.page);
console.log("survives a reload:", JSON.stringify(afterReload) === JSON.stringify(appSnap));

console.log("\nconsole errors — ref:", ref.errors.length ? ref.errors : "clean");
console.log("console errors — app:", app.errors.length ? app.errors : "clean");
console.log("\nRESULT:", bad === 0 && same ? "PASS" : "FAIL");

await browser.close();
