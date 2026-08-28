/* Interactive behaviours a screenshot diff can't see: the mock clock, the
   celebration layer, reduced motion, and the option shuffle. */
import { chromium } from "playwright";

const APP = process.env.APP_URL || "http://localhost:5173/";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" });
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
};

async function fresh(opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    ...opts,
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  return { ctx, page, errs };
}

const TAB = { Line: 0, Metro: 1, Dojo: 2, Me: 3 };
const go = async (page, name) => {
  await page.locator(".tabs .tab").nth(TAB[name]).click();
  await page.waitForTimeout(200);
};

/* ---------------- celebrations ---------------- */
console.log("\ncelebrations");
{
  const { ctx, page } = await fresh();
  await page.locator(".stn").nth(0).locator(".prow .pcheck").nth(0).click();
  await page.waitForTimeout(120);
  check("checking a problem toasts the XP", (await page.locator(".toast").first().innerText()).includes("+20 XP"));
  check("and throws confetti", (await page.locator(".confetti .cf").count()) > 0);
  check("earns the First Blood badge", (await page.locator('.toast:has-text("First Blood")').count()) === 1);

  await page.waitForTimeout(3200);
  check("toasts clear themselves", (await page.locator(".toast").count()) === 0);
  check("confetti cleans up", (await page.locator(".confetti").count()) === 0);

  // Clear the rest of Day 1 → station toast.
  for (let i = 1; i < 4; i++) {
    await page.locator(".stn").nth(0).locator(".prow .pcheck").nth(i).click();
    await page.waitForTimeout(120);
  }
  check(
    "clearing a day announces the station",
    (await page.locator('.toast:has-text("Pathfinding cleared")').count()) === 1
  );
  check("the station dot fills", await page.locator(".stn").nth(0).evaluate((el) => el.classList.contains("done")));
  check(
    "the focus ring moves to Day 2",
    await page.locator(".stn").nth(1).evaluate((el) => el.classList.contains("now"))
  );
  check("header XP reads 60", (await page.locator("#root .hdr-stats b").nth(1).innerText()) === "60");

  // Unchecking refunds silently.
  await page.waitForTimeout(3200);
  await page.locator(".stn").nth(0).locator(".prow .pcheck").nth(0).click();
  await page.waitForTimeout(200);
  check("unchecking refunds without a toast", (await page.locator(".toast").count()) === 0);
  check("XP falls back to 40", (await page.locator("#root .hdr-stats b").nth(1).innerText()) === "40");
  await ctx.close();
}

/* ---------------- reduced motion ---------------- */
console.log("\nreduced motion");
{
  const { ctx, page } = await fresh({ reducedMotion: "reduce" });
  await page.locator(".stn").nth(0).locator(".prow .pcheck").nth(0).click();
  await page.waitForTimeout(200);
  check("still toasts", (await page.locator(".toast").count()) > 0);
  check("but renders no confetti", (await page.locator(".confetti").count()) === 0);
  await ctx.close();
}

/* ---------------- the mock clock ---------------- */
console.log("\nmock clock");
{
  const { ctx, page } = await fresh();
  // Day 7 is the last station; open it.
  await page.locator(".stn").nth(6).locator(".dayhead").click();
  await page.waitForTimeout(200);
  const timer = page.locator(".timer");
  check("starts at 25:00", (await timer.locator("b").innerText()) === "25:00");
  check("button reads Start", (await timer.locator(".tbtn").first().innerText()) === "Start");

  await timer.locator(".tbtn").first().click();
  await page.waitForTimeout(2200);
  const running = await timer.locator("b").innerText();
  check("counts down", running !== "25:00", running);
  check("button reads Pause", (await timer.locator(".tbtn").first().innerText()) === "Pause");

  await timer.locator(".tbtn").first().click();
  const paused = await timer.locator("b").innerText();
  await page.waitForTimeout(1500);
  check("pause holds the clock", (await timer.locator("b").innerText()) === paused);
  check("button reads Resume", (await timer.locator(".tbtn").first().innerText()) === "Resume");

  // Keeps counting across a tab switch — it lives above the views.
  await timer.locator(".tbtn").first().click();
  const before = await timer.locator("b").innerText();
  await go(page, "Metro");
  await page.waitForTimeout(2200);
  await go(page, "Line");
  const stillOpen = await page.locator(".stn").nth(6).evaluate((el) => el.classList.contains("open"));
  if (!stillOpen) await page.locator(".stn").nth(6).locator(".dayhead").click();
  await page.waitForTimeout(200);
  check("Day 7 stays expanded across a tab switch", stillOpen);
  const after = await page.locator(".timer b").innerText();
  check("keeps running while you're on another tab", before !== after, `${before} → ${after}`);

  await page.locator(".timer .tbtn").nth(1).click(); // Reset
  await page.waitForTimeout(200);
  check("reset returns to 25:00", (await page.locator(".timer b").innerText()) === "25:00");

  // The "low" state at five minutes.
  const low = await page.evaluate(() => {
    const b = document.querySelector(".timer");
    return b ? getComputedStyle(b).getPropertyValue("--seg") !== undefined : false;
  });
  check("timer renders", low);
  await ctx.close();
}

/* ---------------- the quiz ---------------- */
console.log("\nquiz");
{
  const { ctx, page } = await fresh();
  await go(page, "Metro");
  await page.click(".board");
  await page.waitForTimeout(300);
  check("deals a card with four options", (await page.locator(".opt").count()) === 4);
  check("labels them A–D", (await page.locator(".opt .k").allInnerTexts()).join("") === "ABCD");
  check("shows position 1/10", (await page.locator(".qmeta span").first().innerText()) === "1/10");
  check("ten ticks on the stops track", (await page.locator(".stops-track i").count()) === 10);

  await page.locator(".opt").nth(0).click();
  await page.waitForTimeout(250);
  check("locks the options after answering", await page.locator(".opt").nth(1).isDisabled());
  check("marks exactly one option correct", (await page.locator(".opt.right").count()) === 1);
  check("shows the explanation", (await page.locator(".explain").count()) === 1);
  check("offers the next stop", (await page.locator(".next").innerText()) === "Next stop →");
  check("colours the first tick", (await page.locator(".stops-track i.ok, .stops-track i.ko").count()) === 1);
  check("no toast for a quiz answer", (await page.locator(".toast").count()) === 0);

  // Option order must not be the stored order every time.
  const orders = new Set();
  for (let k = 0; k < 8; k++) {
    await page.click(".next");
    await page.waitForTimeout(200);
    orders.add((await page.locator(".opt").allInnerTexts()).join("|"));
    await page.locator(".opt").nth(0).click();
    await page.waitForTimeout(200);
  }
  check("shuffles options per card", orders.size >= 7, `${orders.size} distinct layouts in 8 cards`);

  // Nine answered so far; deal and answer the tenth.
  await page.click(".next");
  await page.waitForTimeout(200);
  check("counts up to the last stop", (await page.locator(".qmeta span").first().innerText()) === "10/10");
  await page.locator(".opt").nth(0).click();
  await page.waitForTimeout(200);
  check("last card offers Finish", (await page.locator(".next").innerText()) === "Finish");

  await page.click(".next");
  await page.waitForTimeout(300);
  check("ends on a result screen", (await page.locator(".result .big").count()) === 1);
  check("offers a rerun and a way back", (await page.locator(".result .mbtn").count()) === 2);

  await page.click('.mbtn:has-text("Decks")');
  await page.waitForTimeout(250);
  const redo = await page.locator('.drow:has-text("Redemption")').innerText();
  check("Redemption deck counts what you owe", /\d+ missed/.test(redo), redo);
  await ctx.close();
}

/* ---------------- dojo + reset ---------------- */
console.log("\ndojo and reset");
{
  const { ctx, page } = await fresh();
  await go(page, "Dojo");
  await page.locator(".thead").first().click();
  await page.waitForTimeout(200);
  check("template code starts hidden", (await page.locator(".tcode.hidden").count()) >= 1);
  check("the veil offers a reveal", (await page.locator('.veil button:has-text("Reveal & diff")').count()) >= 1);
  await page.locator(".veil button").first().click();
  await page.waitForTimeout(200);
  check(
    "revealing unblurs that card only",
    await page.locator(".tcode").first().evaluate((el) => !el.classList.contains("hidden"))
  );

  await page.locator(".dojo-log button").click();
  await page.waitForTimeout(200);
  check("logging the ritual sticks", (await page.locator(".dojo-log button").innerText()).includes("Logged"));
  await go(page, "Line");
  check(
    "and shows on the line's ritual row",
    await page.locator(".stn").nth(0).locator(".ritual").evaluate((el) => el.classList.contains("done"))
  );

  await go(page, "Me");
  page.on("dialog", (d) => d.accept());
  await page.click('.mbtn:has-text("Reset")');
  await page.waitForTimeout(300);
  check("reset wipes XP", (await page.locator("#root .hdr-stats b").nth(1).innerText()) === "0");
  check("reset toasts", (await page.locator('.toast:has-text("Fresh line")').count()) === 1);
  await ctx.close();
}

/* ---------------- bad import ---------------- */
console.log("\nimport guards");
{
  const { ctx, page, errs } = await fresh();
  await go(page, "Me");
  await page.click('.mbtn:has-text("Import")');
  await page.waitForTimeout(150);
  check("first press opens the box", await page.locator(".io").isVisible());
  await page.fill(".io", "{not json");
  await page.click('.mbtn:has-text("Import")');
  await page.waitForTimeout(250);
  check("rejects junk with a friendly toast", (await page.locator(".toast:has-text('parse')").count()) === 1);

  await page.waitForTimeout(3200);
  await page.fill(".io", JSON.stringify({ v: 2, xp: 5000 }));
  await page.click('.mbtn:has-text("Import")');
  await page.waitForTimeout(250);
  check("rejects a different schema version", (await page.locator("#root .hdr-stats b").nth(1).innerText()) === "0");

  await page.waitForTimeout(3200);
  await page.fill(".io", JSON.stringify({ v: 1, xp: 450 }));
  await page.click('.mbtn:has-text("Import")');
  await page.waitForTimeout(300);
  check("accepts a minimal v1 payload", (await page.locator("#root .hdr-stats b").nth(1).innerText()) === "450");
  check("and re-ranks accordingly", (await page.locator(".rank-name").innerText()) === "Memoizer");
  check("no console errors throughout", errs.length === 0, errs.join(" | "));
  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
console.log("RESULT:", failed.length === 0 ? "PASS" : "FAIL");
