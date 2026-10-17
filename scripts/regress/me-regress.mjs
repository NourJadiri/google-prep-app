// me-regress.mjs <base-url> <out-dir>
//
// Behaviour + pixel regression suite for the Me tab and cross-device sync: the stats,
// the rank ladder, the badges, the data panel, the sync panel and its status card, the
// link sheet, the consent card, the scanner, and what the Worker's D1 holds after each
// step. One fresh browser context per device (so two devices are two contexts against
// the same `wrangler dev`), every scenario records assertions and screenshots.
//
//   <out-dir>/results.json     { scenario: { assertions: [{name, ok, detail?}], screenshots: [...], ... } }
//   <out-dir>/NN-*.png         the screenshots: NN-<what>-<desktop|phone>-<light|dark>.png
//   <out-dir>/failures/*.png   the last frame of every device of a scenario that failed or threw
//
// Env: WS_JOBS=3   run three scenarios at a time (they share nothing: each mints its own codes)
//      WS_ONLY=03,06   run only scenarios whose id starts with these
//
// me-lib.mjs explains what is fixed (origin, codes, clock, network) so that two runs of the
// same code give identical screenshots. Exit status 1 when any assertion fails.
//
// Two kinds of assertion record what they saw in their *name* rather than in an expected
// value: "styles at <screenshot>: <digest>" (the computed styles and boxes of the page at the
// moment of each screenshot, which sees the changes too small for the pixel diff) and
// "markup of #meArea: <hash>". They always pass; ws-diff reports one that differs between two
// runs as an assertion that exists on one side only.

import { chromium } from "playwright";
import path from "node:path";
import { runSuite } from "./harness.mjs";
import { MeScenario, T0, codeOf, linkOf, configure, d1, finish, launchOptions } from "./me-lib.mjs";
import { SEED, SEED_AWS, SEED_B, SEED_C, LEGACY_V1, LEGACY_V1_UPGRADED, BLANK, FUTURE, qrModules, writeQrClip } from "./me-fixtures.mjs";

const [BASE, OUT] = process.argv.slice(2);
if (!BASE || !OUT) {
  console.error("usage: node me-regress.mjs <base-url> <out-dir>");
  process.exit(2);
}

/* ------------------------------ readers ------------------------------ */

const sections = (page) => page.locator("main .sectionlabel").allTextContents();

const stats = (page) =>
  page.locator("#meArea .statgrid .stat").evaluateAll((els) => els.map((e) => `${e.querySelector("b").textContent} ${e.querySelector("span").textContent}`));

const ladder = (page) =>
  page.locator("#meArea .ladder li").evaluateAll((els) =>
    els.map((li) => ({
      name: li.childNodes[1].textContent,
      xp: li.querySelector(".lxp").textContent,
      cls: li.className,
      mark: li.querySelector(".lmark svg") ? "check" : li.querySelector(".ldot.dim") ? "dim" : "dot",
      color: li.querySelector(".ldot")?.style.color || "",
    }))
  );

const badges = (page) =>
  page.locator("#meArea .badges .badge").evaluateAll((els) =>
    els.map((b) => ({ name: b.querySelector("span:last-child").textContent, locked: b.classList.contains("locked"), title: b.title, color: b.querySelector(".ic").style.color }))
  );

const hero = (page) => page.locator("main .hero").evaluate((e) => ({ h1: e.querySelector("h1").textContent, p: e.querySelector("p").textContent }));

const headerRank = (page) => page.locator("header.hdr").evaluate((h) => ({ rank: h.querySelector(".rank-name").textContent, xp: h.querySelector(".hdr-stats span:last-child b").textContent, sub: h.querySelector(".xp-sub").innerText.replace(/\s+/g, " ").trim() }));

const noHScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

/* The status card: its words, what it draws and the colour it is tinted with. The glyph is told apart by
   the stroke that sets it apart (a tick, an up arrow, a slash, a triangle), since icons carry no names. */
const GLYPH = {
  "m8.5 17 2.5 2.5 4.5-4.5": "cloud-check",
  "M12 21v-8": "cloud-upload",
  "m2 2 20 20": "cloud-off",
  "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3": "alert-triangle",
};
const card = (page) =>
  page.locator("main .synccard").evaluate((c, glyphs) => ({
    title: c.querySelector(".synctext b").textContent,
    when: c.querySelector(".synctext span")?.textContent ?? null,
    tone: c.style.color,
    glyph: [...c.querySelectorAll(".ic svg path")].map((p) => glyphs[p.getAttribute("d")]).find(Boolean) ?? "?",
  }), GLYPH);
const syncNote = (page) => page.locator("main > section > .storenote").evaluateAll((els) => els.map((e) => e.textContent)).then((a) => a.join(" | "));
const panelButtons = (page) => page.locator("main > section > .mrow").first().locator(".mbtn").evaluateAll((els) => els.map((e) => e.textContent.trim() + (e.disabled ? " (disabled)" : "")));

/* The link sheet and the consent card, as text. */
const SHEET = '[role=dialog][aria-label="Link a device"]';
const sheet = (page) => page.locator(SHEET);
const sheetState = (page) =>
  page.locator(SHEET).evaluate((d) => ({
    mode: [...d.querySelectorAll(".segtoggle button")].map((b) => `${b.textContent}:${b.getAttribute("aria-pressed")}`),
    code: d.querySelector(".synccode")?.textContent ?? null,
    hint: d.querySelector(".qrhint")?.textContent ?? null,
    warn: d.querySelector(".qrwarn")?.textContent ?? null,
    wait: d.querySelector(".qrwait")?.textContent ?? null,
    linked: d.querySelector(".qrlinked")?.textContent ?? null,
    sub: [...d.querySelectorAll(".sheetsub .sublink")].map((b) => b.textContent),
    paste: d.querySelector(".sheetsub input")?.placeholder ?? null,
    enable: [...d.querySelectorAll(".qrenable .mbtn")].map((b) => b.textContent),
    qr: !!d.querySelector(".qrbig svg"),
  }));
const consent = (page) =>
  page.locator(".linkcard").evaluate((c) => ({
    title: c.querySelector("h3").textContent,
    code: c.querySelector("code").textContent,
    notes: [...c.querySelectorAll("p")].slice(1).map((p) => p.textContent),
    buttons: [...c.querySelectorAll("button")].map((b) => b.textContent + (b.disabled ? " (disabled)" : "")),
  }));

/* Does the square on screen encode `link`? Compared module by module with what the `qrcode` package makes of it. */
async function qrCheck(page, link) {
  const got = await page.locator(`${SHEET} .qrbig svg`).evaluate((svg) => ({
    box: svg.getAttribute("viewBox"),
    d: svg.querySelector("path").getAttribute("d"),
    label: svg.getAttribute("aria-label"),
    role: svg.getAttribute("role"),
    shape: svg.getAttribute("shape-rendering"),
    size: [svg.getAttribute("width"), svg.getAttribute("height")].join("x"),
    fills: [...svg.querySelectorAll("rect, path")].map((e) => e.getAttribute("fill")),
  }));
  const m = qrModules(link);
  const want = new Set();
  m.forEach((row, r) => row.forEach((dark, c) => dark && want.add(`M${c + 4} ${r + 4}h1v1h-1z`)));
  const have = got.d.match(/M\d+ \d+h1v1h-1z/g) ?? [];
  return {
    same: have.length === want.size && have.every((x) => want.has(x)),
    box: got.box === `0 0 ${m.length + 8} ${m.length + 8}`,
    fills: got.fills.join(" "),
    label: got.label,
    role: got.role,
    shape: got.shape,
    size: got.size,
  };
}
const QR_OK = (label) => ({ same: true, box: true, fills: "#ffffff #202124", label, role: "img", shape: "crispEdges", size: "100%x100%" });
const GET_LABEL = "QR code — scan it with the device that has your progress";
const SEND_LABEL = "QR code — scan it with the device you want to link";

/* An edit the way a reader makes one: paste an export and Import it. The clock is held before the Import is
   pressed, so the 4 s push debounce starts at a known instant and only the scenario's own advance() moves it. */
async function edit(D, blob) {
  const u = ui(D.page);
  await u.import.click();
  await u.box.fill(JSON.stringify(blob));
  await D.pause();
  await u.import.click();
}

/* What the device has saved, once the 350 ms save debounce has had its time. */
async function saved(D) {
  await D.advance(400);
  return D.blob();
}

/* Key order is not part of what a blob says. */
const canonOf = (v) => (Array.isArray(v) ? v.map(canonOf) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonOf(v[k])])) : v);

/* The controls of the Data and Sync panels, by their visible names. */
const ui = (page) => ({
  export: page.getByRole("button", { name: "Export progress" }),
  import: page.getByRole("button", { name: "Import", exact: true }),
  reset: page.getByRole("button", { name: "Reset", exact: true }),
  box: page.getByLabel("Progress export and import"),
  turnOn: page.getByRole("button", { name: "Turn on sync" }),
  haveCode: page.getByRole("button", { name: "I have a code" }),
  link: page.getByRole("button", { name: "Link a device" }),
  syncNow: page.getByRole("button", { name: "Sync now" }),
  turnOff: page.getByRole("button", { name: "Turn off" }),
  chip: page.locator("main .synccode"),
  card: page.locator(".synccard"),
  codeInput: page.getByLabel("Sync code"),
  connect: page.getByRole("button", { name: "Connect", exact: true }),
});

/* ------------------------------ scenarios ------------------------------ */

const scenarios = [];
const scenario = (id, title, fn, opts = {}) => scenarios.push({ id, title, fn, serial: !!opts.serial });

/* 1 ------------------------------------------------------------------ */
scenario("01-render", "the Me tab: stats, rank ladder, badges, data and sync panels, seeded and fresh", async (s) => {
  const A = await s.device({ seed: SEED });
  await A.openMe();
  const page = A.page;

  await s.expect("the Me tab is the current section", () => page.getByRole("navigation", { name: "Sections" }).getByRole("button", { name: "Me", exact: true }).getAttribute("aria-current"), "page");
  await s.expect("the hero names the line being ridden", () => hero(page), { h1: "Your line", p: "The numbers, the ranks, the hardware — Onsite Express." });
  await s.expect("section labels in order: ranks, hardware, data (inside #meArea), then sync (outside it)", async () => ({
    all: await sections(page),
    inside: await page.locator("#meArea .sectionlabel").allTextContents(),
  }), { all: ["Rank ladder", "Hardware", "Data", "Sync"], inside: ["Rank ladder", "Hardware", "Data"] });
  await s.expect("six stat tiles on the Google line, from the seeded progress", () => stats(page), [
    "22/115 problems", "5/24 stations", "5/24 rituals", "134 cards", "75% accuracy", "6 best streak",
  ]);
  await s.expect("the ladder: ten rungs, five climbed (check), Pattern Oracle current, four to go (dim)", () => ladder(page), [
    { name: "Wanderer", xp: "0 XP", cls: "past", mark: "check", color: "" },
    { name: "Pathfinder", xp: "100 XP", cls: "past", mark: "check", color: "" },
    { name: "Backtracker", xp: "250 XP", cls: "past", mark: "check", color: "" },
    { name: "Memoizer", xp: "450 XP", cls: "past", mark: "check", color: "" },
    { name: "Tabulator", xp: "700 XP", cls: "past", mark: "check", color: "" },
    { name: "Pattern Oracle", xp: "1000 XP", cls: "cur", mark: "dot", color: "var(--red)" },
    { name: "Noogler", xp: "1350 XP", cls: "", mark: "dim", color: "" },
    { name: "Graph Whisperer", xp: "1800 XP", cls: "", mark: "dim", color: "" },
    { name: "DP Sensei", xp: "2250 XP", cls: "", mark: "dim", color: "" },
    { name: "Offer Letter", xp: "2750 XP", cls: "", mark: "dim", color: "" },
  ]);
  await s.expect("the hardware grid: the Google line's twelve badges, five earned, the rest locked, tinted in rotation", () => badges(page), [
    { name: "First Blood", locked: false, title: "Clear your first problem", color: "var(--blue)" },
    { name: "Template Monk", locked: false, title: "Log 5 morning rituals", color: "var(--red)" },
    { name: "Metro Rat", locked: false, title: "Answer 100 cards", color: "var(--yellow)" },
    { name: "Perfect Run", locked: true, title: "Score 10/10 in a session", color: "var(--green)" },
    { name: "Exterminator", locked: true, title: "20 bug hunts right", color: "var(--blue)" },
    { name: "Heating Up", locked: false, title: "3-day streak", color: "var(--red)" },
    { name: "Full Week", locked: true, title: "7-day streak", color: "var(--yellow)" },
    { name: "Halfway There", locked: true, title: "Clear 12 stations", color: "var(--green)" },
    { name: "End of the Line", locked: true, title: "Clear all 24 stations", color: "var(--blue)" },
    { name: "Noogler", locked: true, title: "Reach the top rank", color: "var(--red)" },
    { name: "All Green", locked: true, title: "Pass every test of a problem in the editor", color: "var(--yellow)" },
    { name: "Test Pilot", locked: true, title: "Pass 25 problems in the editor", color: "var(--green)" },
  ]);
  await s.expect("every badge carries a drawn icon, none an emoji", () => page.locator("#meArea .badge .ic svg").count(), 12);
  await s.expect("the header agrees with the ladder (rank, XP, station)", () => headerRank(page), { rank: "Pattern Oracle", xp: "1240", sub: "Day 6 Grid Gardens 110 XP to Noogler" });
  await s.expect("the data panel at rest: Export, Import, Reset; the textarea hidden and empty", async () => ({
    buttons: await page.locator("#meArea .mrow .mbtn").allTextContents(),
    danger: await page.locator("#meArea .mrow .mbtn.danger").allTextContents(),
    box: await page.locator("textarea.io").evaluate((t) => ({ cls: t.className, display: getComputedStyle(t).display, value: t.value, label: t.getAttribute("aria-label"), ph: t.placeholder })),
  }), {
    buttons: ["Export progress", "Import", "Reset"],
    danger: ["Reset"],
    box: { cls: "io", display: "none", value: "", label: "Progress export and import", ph: "Paste an export here, then tap Import again." },
  });
  await s.expect("the storage note says where progress lives", () => page.locator("#meArea .storenote").textContent(), "Progress saves in this browser (localStorage). Export to move it between devices.");
  await s.expect("the sync panel with sync off: three buttons and the explaining note", async () => ({
    buttons: await page.locator("main > section > .mrow .mbtn").allTextContents(),
    note: await page.locator("main > section > .storenote").textContent(),
    card: await page.locator(".synccard").count(),
  }), {
    buttons: ["Turn on sync", "I have a code", "Link a device"],
    note: "Sync mirrors progress through the app's own cloud store. Turn it on here, then enter the code on the next device — the cloud copy wins there, so export first if that device has progress worth keeping.",
    card: 0,
  });
  await s.expect("the stats grid is three columns of equal tiles with 10px between them", () => page.locator("#meArea .statgrid").evaluate((g) => {
    const tiles = [...g.children].map((t) => t.getBoundingClientRect());
    return { cols: getComputedStyle(g).gridTemplateColumns.split(" ").length, gap: getComputedStyle(g).columnGap, widths: [...new Set(tiles.map((r) => Math.round(r.width * 10) / 10))].length, firstRow: tiles.slice(0, 3).map((r) => Math.round(r.y)).every((y, _, a) => y === a[0]) };
  }), { cols: 3, gap: "10px", widths: 1, firstRow: true });
  await s.expect("the badges grid is four columns", () => page.locator("#meArea .badges").evaluate((g) => getComputedStyle(g).gridTemplateColumns.split(" ").length), 4);
  await s.expect("nothing overflows the width of the window", () => noHScroll(page), true);
  await s.marked(A, "#meArea (the subtree the parity harness diffs against the reference)", "#meArea");
  await A.shot("me", { tall: true });
  await A.setDark(true);
  await A.shot("me", { tall: true });

  // ---- a fresh profile
  const F = await s.device({});
  await F.openMe();
  await s.expect("fresh profile: every tile at zero", () => stats(F.page), ["0/115 problems", "0/24 stations", "0/24 rituals", "0 cards", "0% accuracy", "0 best streak"]);
  await s.expect("fresh profile: Wanderer is current (blue dot), nine rungs ahead, nothing climbed", async () => {
    const l = await ladder(F.page);
    return { cur: l.filter((r) => r.cls === "cur").map((r) => [r.name, r.mark, r.color]), past: l.filter((r) => r.cls === "past").length, dim: l.filter((r) => r.mark === "dim").length };
  }, { cur: [["Wanderer", "dot", "var(--blue)"]], past: 0, dim: 9 });
  await s.expect("fresh profile: all twelve badges locked", async () => (await badges(F.page)).filter((b) => b.locked).length, 12);
  await s.expect("fresh profile: the header says Wanderer, 0 XP, Day 1", () => headerRank(F.page), { rank: "Wanderer", xp: "0", sub: "Day 1 Pathfinding 100 XP to Pathfinder" });
  await F.shot("fresh", { tall: true });
  await F.setDark(true);
  await F.shot("fresh", { tall: true });

  // ---- riding the Local
  const L = await s.device({ seed: SEED_AWS });
  await L.openMe();
  await s.expect("on the Local the hero says so", () => hero(L.page), { h1: "Your line", p: "The numbers, the ranks, the hardware — Day One Local." });
  await s.expect("on the Local the third tile counts problems passed in the editor, not rituals", () => stats(L.page), ["8/55 problems", "1/13 stations", "3 passed in editor", "134 cards", "75% accuracy", "6 best streak"]);
  await s.expect("the Local's ladder: seven rungs, Phone Screen current in the Local's ink", async () => {
    const l = await ladder(L.page);
    return { names: l.map((r) => r.name), cur: l.filter((r) => r.cls === "cur").map((r) => [r.name, r.color]), past: l.filter((r) => r.cls === "past").length };
  }, { names: ["Applicant", "Online Assessment", "Phone Screen", "On the Loop", "Bar Raiser", "Offer Extended", "Day One"], cur: [["Phone Screen", "var(--aws-ink)"]], past: 2 });
  await s.expect("the Local's eleven badges (its own milestones, no ritual or station badges of the Google line)", async () => (await badges(L.page)).map((b) => `${b.locked ? "-" : "+"}${b.name}`), [
    "+First Delivery", "+Metro Rat", "-Perfect Run", "-Exterminator", "+Heating Up", "-Full Week", "-Halfway House", "-Doors Open", "-Day One", "-All Green", "-Test Pilot",
  ]);
  await s.expect("the app is tinted for the Local (data-track on <html>)", () => L.page.evaluate(() => document.documentElement.dataset.track), "aws");
  await L.shot("local", { tall: true });

  // ---- a phone
  const P = await s.device({ seed: SEED, phone: true });
  await P.openMe();
  await s.expect("phone: the same six tiles", () => stats(P.page), ["22/115 problems", "5/24 stations", "5/24 rituals", "134 cards", "75% accuracy", "6 best streak"]);
  await s.expect("phone: three tile columns and four badge columns survive 390px", async () => ({
    stats: await P.page.locator("#meArea .statgrid").evaluate((g) => getComputedStyle(g).gridTemplateColumns.split(" ").length),
    badges: await P.page.locator("#meArea .badges").evaluate((g) => getComputedStyle(g).gridTemplateColumns.split(" ").length),
  }), { stats: 3, badges: 4 });
  await s.expect("phone: nothing overflows the width of the window", () => noHScroll(P.page), true);
  await s.expect("phone: the sync buttons wrap but all stay inside the window", () => P.page.locator("main > section > .mrow .mbtn").evaluateAll((els) => els.every((e) => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })), true);
  await P.shot("me", { tall: true });
  await P.setDark(true);
  await P.shot("me", { tall: true });
  finish(s);
});

/* 2 ------------------------------------------------------------------ */
scenario("02-data", "Data panel: Export, Import (v2, legacy v1, refusals), Reset with its confirm", async (s) => {
  const WIPE = "Wipe all progress, XP and badges — on both lines?";
  const REFUSED = ["That didn't parse — paste a full export"];
  const A = await s.device({ seed: SEED });
  await A.openMe();
  const page = A.page;
  const u = ui(page);
  const seededStats = ["22/115 problems", "5/24 stations", "5/24 rituals", "134 cards", "75% accuracy", "6 best streak"];

  // ---- Import asks to be told what to import
  await A.clearToasts();
  await u.import.click();
  await s.expect("Import with nothing pasted opens the box and says what to do", async () => ({
    toasts: await A.toasts(),
    box: await u.box.evaluate((t) => ({ cls: t.className, display: getComputedStyle(t).display })),
  }), { toasts: ["Paste your export, then tap Import again"], box: { cls: "io on", display: "block" } });
  await s.expect("…and puts the caret in it", () => page.evaluate(() => document.activeElement?.getAttribute("aria-label")), "Progress export and import");
  await s.expect("…and changes nothing (no save, tiles as before)", async () => ({ stats: await stats(page), blob: await A.blob() }), { stats: seededStats, blob: SEED });
  await A.clearToasts();
  await u.box.fill("   \n ");
  await u.import.click();
  await s.expect("Import with only whitespace in the box says the same", () => A.toasts(), ["Paste your export, then tap Import again"]);

  // ---- Export
  await A.clearToasts();
  await u.export.click();
  await s.expect("Export fills the box with the progress as JSON (what the app holds, nothing else)", async () => JSON.parse(await u.box.inputValue()), SEED);
  await s.expect("…the box is open, focused, and its whole text is selected", () => u.box.evaluate((t) => ({ on: t.classList.contains("on"), focus: document.activeElement === t, from: t.selectionStart, to: t.selectionEnd, len: t.value.length })), (v) => v.on && v.focus && v.from === 0 && v.to === v.len && v.len > 500);
  await s.expect("…and a plain 'Copied to clipboard' toast confirms the copy", () => A.toasts(), ["Copied to clipboard"]);
  await s.expect("…the clipboard holds exactly the box's text", async () => (await page.evaluate(() => navigator.clipboard.readText())) === (await u.box.inputValue()), true);
  await s.expect("exporting saves nothing and changes nothing", async () => ({ stats: await stats(page), blob: await A.blob() }), { stats: seededStats, blob: SEED });
  await A.shot("export-open");
  await A.setDark(true);
  await A.shot("export-open");
  await A.setDark(false);

  // ---- Import: refusals first, with the real export still in the box
  const refuse = async (what, text) => {
    await A.clearToasts();
    await u.box.fill(text);
    await u.import.click();
    await s.expect(`Import refuses ${what}`, async () => ({ toasts: await A.toasts(), stats: await stats(page) }), { toasts: REFUSED, stats: seededStats });
  };
  await refuse("text that is not JSON", "this is not json {");
  await refuse("JSON that is not an export", '{"hello": "world"}');
  await refuse("an export from a future version", JSON.stringify(FUTURE));
  await refuse("a JSON array", "[1, 2, 3]");
  await refuse("a bare JSON string", '"v2"');
  await s.expect("…and a refusal leaves the saved progress alone", () => A.blob(), SEED);
  await u.box.fill("this is not json {");
  await A.shot("import-refused");

  // ---- Import: a v2 export
  await A.clearToasts();
  await u.box.fill(JSON.stringify(SEED_B));
  await u.import.click();
  await s.expect("Import of a v2 export: gold 'Progress imported'", () => A.toasts(), ["* Progress imported"]);
  await s.expect("…the tiles, ladder and header now show the imported progress", async () => ({ stats: await stats(page), rank: (await headerRank(page)).rank }), {
    stats: ["8/115 problems", "2/24 stations", "2/24 rituals", "40 cards", "70% accuracy", "3 best streak"], rank: "Memoizer",
  });
  await s.expect("…and it is saved (after the 350 ms debounce), exactly as imported", () => A.blob(), SEED_B);
  await s.expect("…the box keeps what was pasted", async () => JSON.parse(await u.box.inputValue()), SEED_B);

  // ---- Import: the original app's v1 export
  await A.clearToasts();
  await u.box.fill(JSON.stringify(LEGACY_V1));
  await u.import.click();
  await s.expect("Import of a v1 export (the original app's): gold 'Progress imported'", () => A.toasts(), ["* Progress imported"]);
  await s.expect("…its xp, problems and rituals land on the Google line", () => stats(page), ["5/115 problems", "1/24 stations", "2/24 rituals", "12 cards", "75% accuracy", "2 best streak"]);
  await s.expect("…and the saved blob is the v2 upgrade (the Local starts empty)", () => A.blob(), LEGACY_V1_UPGRADED);
  await s.expect("…rank Pathfinder (215 XP)", async () => (await headerRank(page)).rank, "Pathfinder");
  await A.shot("import-legacy");

  // ---- Import vets what it takes: unknown lines fall back to Google, XP is rounded and floored, stale ids are not counted
  await A.clearToasts();
  const odd = { v: 2, track: "nowhere", tracks: { google: { xp: 12.6, done: { ap: true, "two-sum": true, zzz: true }, rituals: { d1: "2026-03-01" }, accepted: { ap: 5, bad: "x" } }, aws: { xp: -5 } }, quiz: { answered: "7" }, badges: null, streak: {}, extra: "from somewhere" };
  await u.box.fill(JSON.stringify(odd));
  await u.import.click();
  await s.expect("an odd but readable v2 export is accepted", () => A.toasts(), ["* Progress imported"]);
  await s.expect("…and read the way the app reads every import: a made-up line becomes Google, 12.6 XP is 13, -5 is 0, text where a number goes is 0", async () => ({ stats: await stats(page), rank: await headerRank(page) }), {
    stats: ["1/115 problems", "0/24 stations", "1/24 rituals", "0 cards", "0% accuracy", "0 best streak"],
    rank: { rank: "Wanderer", xp: "13", sub: "Day 1 Pathfinding 87 XP to Pathfinder" },
  });
  await s.expect("…the saved blob is the vetted one: stale ids kept but not counted, the non-numeric stamp dropped, a key it does not know carried along", () => A.blob(), {
    ...BLANK,
    tracks: { google: { xp: 13, done: { ap: true, "two-sum": true, zzz: true }, rituals: { d1: "2026-03-01" }, accepted: { ap: 5 } }, aws: BLANK.tracks.aws },
    extra: "from somewhere",
  });

  // ---- Reset: decline, then accept
  await A.clearToasts();
  const declined = await A.answering(false, () => u.reset.click());
  await s.expect("Reset asks first, naming both lines", () => declined, [`confirm: ${WIPE}`]);
  await s.expect("…declining it changes nothing: no toast, same tiles, same saved blob", async () => ({ toasts: await A.toasts(), stats: await stats(page), blob: canonOf(await A.blob()).tracks.google.xp }), {
    toasts: [], stats: ["1/115 problems", "0/24 stations", "1/24 rituals", "0 cards", "0% accuracy", "0 best streak"], blob: 13,
  });
  const accepted = await A.answering(true, () => u.reset.click());
  await s.expect("Reset, accepted, asks the same once", () => accepted, [`confirm: ${WIPE}`]);
  await s.expect("…a plain (not gold) 'Fresh start. Day 1 awaits.' toast", () => A.toasts(), ["Fresh start. Day 1 awaits."]);
  await s.expect("…every tile at zero and the header back to Wanderer", async () => ({ stats: await stats(page), rank: (await headerRank(page)).rank }), {
    stats: ["0/115 problems", "0/24 stations", "0/24 rituals", "0 cards", "0% accuracy", "0 best streak"], rank: "Wanderer",
  });
  await s.expect("…and a blank blob is what gets saved", () => A.blob(), BLANK);
  await A.shot("reset-done");

  // ---- Reset on the Local: both lines go, the reader stays where they were
  const L = await s.device({ seed: SEED_AWS });
  await L.openMe();
  const lu = ui(L.page);
  await L.clearToasts();
  await L.answering(true, () => lu.reset.click());
  await s.expect("Reset on the Local: 'Fresh start. Stop 1 awaits.' (its unit is Stop)", () => L.toasts(), ["Fresh start. Stop 1 awaits."]);
  await s.expect("…both lines are wiped but the Local stays the line shown", async () => ({ blob: await L.blob(), hero: (await hero(L.page)).p }), { blob: { ...BLANK, track: "aws" }, hero: "The numbers, the ranks, the hardware — Day One Local." });

  // ---- the clipboard says no
  const D = await s.device({ seed: SEED, clipboardStub: "denied" });
  await D.openMe();
  const du = ui(D.page);
  await D.clearToasts();
  await du.export.click();
  await s.expect("Export with a clipboard that refuses: the box is still filled and selected", () => du.box.evaluate((t) => ({ on: t.classList.contains("on"), sel: t.selectionEnd - t.selectionStart === t.value.length && t.value.length > 500 })), { on: true, sel: true });
  await s.expect("…the toast is optimistic, as before, and nothing was thrown", async () => ({ toasts: await D.toasts(), tried: (await D.page.evaluate(() => window.__clip)).length }), { toasts: ["Copied to clipboard"], tried: 1 });
  const T = await s.device({ seed: SEED, clipboardStub: "throws" });
  await T.openMe();
  await T.clearToasts();
  await ui(T.page).export.click();
  await s.expect("Export where writeText throws outright: box filled, no toast, no crash", async () => ({ toasts: await T.toasts(), len: (await ui(T.page).box.inputValue()).length > 500 }), { toasts: [], len: true });
  const N = await s.device({ seed: SEED, clipboardStub: "absent" });
  await N.openMe();
  await N.clearToasts();
  await ui(N.page).export.click();
  await s.expect("Export with no clipboard API at all: box filled and selected, no toast", async () => ({ toasts: await N.toasts(), len: (await ui(N.page).box.inputValue()).length > 500 }), { toasts: [], len: true });

  // ---- storage blocked: the app keeps working in memory and says so
  const M = await s.device({ noStorage: true });
  await M.openMe();
  const mu = ui(M.page);
  await s.expect("with storage blocked the note says progress lives only in this session", () => M.page.locator("#meArea .storenote").textContent(), "Storage isn't available here, so progress lives only in this session — export before closing.");
  await mu.import.click();
  await mu.box.fill(JSON.stringify(SEED_B));
  await mu.import.click();
  await s.expect("…and Import still works, in memory", () => stats(M.page), ["8/115 problems", "2/24 stations", "2/24 rituals", "40 cards", "70% accuracy", "3 best streak"]);
  finish(s);
});

/* 3 ------------------------------------------------------------------ */
scenario("03-sync-on", "turn on sync: the code, the status card, Sync now, copy, the minute tick, Turn off; what D1 holds", async (s) => {
  const code = codeOf(3, "a", 1);
  const code2 = codeOf(3, "a", 2);
  await s.expect("precondition: D1 holds nothing under the code about to be minted", async () => (await d1.get(code)).status, 404);
  const A = await s.device({ seed: SEED });
  await A.openMe();
  const page = A.page;
  const u = ui(page);
  const asUpdate = (x) => ({ updatedAt: x, v: 2, track: "google", data: x });

  // ---- turn on, with the push held so the working state can be looked at
  const release = A.net.hold();
  await A.clearToasts();
  await u.turnOn.click();
  await s.expect("the push is on its way (one PUT, nothing pulled first), held", async () => ({ put: A.net.count("PUT", code), get: A.net.count("GET"), inflight: A.net.inflight }), { put: 1, get: 0, inflight: 1 });
  await s.expect("Turn on sync: a gold toast says to enter the code on the other device", () => A.toasts(), ["* Sync is on — enter this code on your other device"]);
  await s.expect("the card says Syncing… in blue with the upload cloud, and has never synced", () => card(page), { title: "Syncing…", when: null, tone: "var(--blue)", glyph: "cloud-upload" });
  await s.expect("the minted code is on the chip, which says it copies on tap", async () => ({ text: await u.chip.textContent(), title: await u.chip.getAttribute("title") }), { text: code, title: "Tap to copy" });
  await s.expect("while it works: Sync now is disabled, and Link a device and Turn off are there", () => panelButtons(page), ["Sync now (disabled)", "Link a device", "Turn off"]);
  await s.expect("a working card has no note under it", () => syncNote(page), "");
  await s.expect("the config is saved with the code, a stamp for the edit, nothing acknowledged yet", async () => {
    const c = await A.cfg();
    return { code: c.code, edited: c.editedAt >= T0 && c.editedAt < T0 + 120_000, server: c.serverAt, ok: c.okAt, joining: c.joining ?? null };
  }, { code, edited: true, server: 0, ok: 0, joining: null });
  await s.expect("D1 is still empty while the push is held", async () => (await d1.get(code)).status, 404);
  await A.shot("sync-working", { bottom: true });
  release();
  await s.expect("the card settles on All changes synced, green, last synced just now", () => card(page), { title: "All changes synced", when: "Last synced just now", tone: "var(--green)", glyph: "cloud-check" });
  await s.expect("…with the note that points at the other device", () => syncNote(page), "Enter the code above on another device to link it.");
  await s.expect("…Sync now is enabled again", () => panelButtons(page), ["Sync now", "Link a device", "Turn off"]);
  const cfg1 = await A.cfg();
  await s.expect("the stamp was acknowledged: serverAt equals editedAt, okAt is set", () => A.cfg(), (c) => c.serverAt === c.editedAt && c.editedAt > 0 && c.okAt >= c.editedAt);
  const row1 = await d1.get(code);
  await s.expect("D1 now holds the seeded progress under that code: v2, Google line, this device's stamp", () => ({ status: row1.status, v: row1.body.v, track: row1.body.track, at: row1.body.updatedAt === cfg1.editedAt, data: row1.body.data }), { status: 200, v: 2, track: "google", at: true, data: SEED });
  await s.expect("what was PUT is exactly { updatedAt, data } for that stamp", () => ({ ...A.net.list("PUT", code)[0].sent, updatedAt: A.net.list("PUT", code)[0].sent.updatedAt === cfg1.editedAt }), { updatedAt: true, data: SEED });
  await s.expect("no echo: one PUT in all, no GET", async () => ({ put: A.net.count("PUT"), get: A.net.count("GET") }), { put: 1, get: 0 });
  await A.shot("sync-synced", { bottom: true });
  await A.setDark(true);
  await A.shot("sync-synced", { bottom: true });
  await A.setDark(false);

  // ---- Sync now with nothing to do, and copying the code
  await A.clearToasts();
  await u.syncNow.click();
  await s.expect("Sync now when level: a plain 'Already in sync', one GET and no PUT", async () => ({ toasts: await A.toasts(), get: A.net.count("GET", code), put: A.net.count("PUT") }), { toasts: ["Already in sync"], get: 1, put: 1 });
  await A.clearToasts();
  await u.chip.click();
  await s.expect("tapping the chip copies the code: 'Code copied', and the clipboard has it", async () => ({ toasts: await A.toasts(), clip: await page.evaluate(() => navigator.clipboard.readText()) }), { toasts: ["Code copied"], clip: code });

  // ---- an edit: queued, held for 4 s, then pushed
  await edit(A, SEED_B);
  await s.expect("an edit makes the card say Changes queued, with its note, in blue", async () => ({ card: await card(page), note: await syncNote(page) }), {
    card: { title: "Changes queued", when: "Last synced just now", tone: "var(--blue)", glyph: "cloud-upload" },
    note: "They go up in a moment, or the next time there's a network.",
  });
  await s.expect("…the stamp is ahead of the acknowledged one (that is the dirty flag)", async () => { const c = await A.cfg(); return c.editedAt > c.serverAt; }, true);
  await A.shot("sync-pending", { bottom: true });
  await A.advance(3900);
  await s.expect("3.9 s later nothing has been sent: still queued, D1 unchanged, one PUT in all", async () => ({ title: (await card(page)).title, xp: (await d1.get(code)).body.data.tracks.google.xp, put: A.net.count("PUT") }), { title: "Changes queued", xp: 1240, put: 1 });
  await A.advance(200);
  await s.expect("at 4 s the push goes out and the card is synced again", () => card(page).then((c) => c.title), "All changes synced");
  await s.expect("D1 holds the edit, under the stamp the device sent", async () => { const r = await d1.get(code); const c = await A.cfg(); return { data: r.body.data, at: r.body.updatedAt === c.editedAt && c.serverAt === c.editedAt, put: A.net.count("PUT") }; }, { data: SEED_B, at: true, put: 2 });

  // ---- two edits inside the window are one push, of the last
  await edit(A, SEED_C);
  await A.advance(2000);
  await edit(A, SEED);
  await A.advance(2000);
  await s.expect("two edits 2 s apart: 4 s after the first, still nothing sent (the second restarted the wait)", async () => ({ put: A.net.count("PUT"), title: (await card(page)).title }), { put: 2, title: "Changes queued" });
  await A.advance(2100);
  await s.expect("…and 4 s after the second a single PUT carries the last edit", async () => ({ put: A.net.count("PUT"), data: (await d1.get(code)).body.data }), { put: 3, data: SEED });

  // ---- Sync now pushes a queued edit at once, and the debounce timer then finds nothing to do
  await edit(A, SEED_B);
  await A.clearToasts();
  await u.syncNow.click();
  await s.expect("Sync now with an edit queued: gold 'Pushed to the cloud', D1 has it", async () => ({ toasts: await A.toasts(), data: (await d1.get(code)).body.data, put: A.net.count("PUT") }), { toasts: ["* Pushed to the cloud"], data: SEED_B, put: 4 });
  await A.advance(5000);
  await s.expect("…and the debounce that was still pending sends nothing more", () => A.net.count("PUT"), 4);

  // ---- "last synced" ages on its own, every 30 s, in whole minutes, hours, days
  const when = () => card(page).then((c) => c.when);
  await s.expect("just synced: 'just now'", when, "Last synced just now");
  await A.advance(30_000);
  await s.expect("30 s on: still 'just now' (under 45 s)", when, "Last synced just now");
  await A.advance(30_000);
  await s.expect("60 s on: '1m ago' (the minute tick redrew it)", when, "Last synced 1m ago");
  await A.advance(240_000);
  await s.expect("5 minutes on: '5m ago'", when, "Last synced 5m ago");
  await A.shot("sync-ago", { bottom: true });
  await A.advance(6_900_000);
  await s.expect("2 hours on: '2h ago'", when, "Last synced 2h ago");
  await A.jump(86_400_000);
  await s.expect("a day on: '1d ago'", when, "Last synced 1d ago");
  await s.expect("aging is only a redraw: the card still says All changes synced and nothing was sent", async () => ({ title: (await card(page)).title, put: A.net.count("PUT") }), { title: "All changes synced", put: 4 });

  // ---- Turn off: decline, then accept
  const STOP = "Stop syncing on this device? Progress here and in the cloud both stay.";
  await A.clearToasts();
  const declined = await A.answering(false, () => u.turnOff.click());
  await s.expect("Turn off asks first: progress here and in the cloud both stay", () => declined, [`confirm: ${STOP}`]);
  await s.expect("…declining changes nothing: still on, same code, no toast, config kept", async () => ({ chip: await u.chip.textContent(), toasts: await A.toasts(), cfg: (await A.cfg())?.code }), { chip: code, toasts: [], cfg: code });
  const accepted = await A.answering(true, () => u.turnOff.click());
  await s.expect("Turn off, accepted, asks the same once", () => accepted, [`confirm: ${STOP}`]);
  await s.expect("…a plain 'Sync is off' toast and the panel is back to its three first buttons", async () => ({ toasts: await A.toasts(), buttons: await panelButtons(page), card: await u.card.count() }), { toasts: ["Sync is off"], buttons: ["Turn on sync", "I have a code", "Link a device"], card: 0 });
  await s.expect("…the saved config is gone, the progress is still here, and the cloud copy stays", async () => ({ cfg: await A.cfg(), stats: (await stats(page))[0], row: (await d1.get(code)).body.data }), { cfg: null, stats: "8/115 problems", row: SEED_B });
  await edit(A, SEED_C);
  await A.advance(8000);
  await s.expect("an edit after Turn off is never sent", async () => ({ put: A.net.count("PUT"), row: (await d1.get(code)).body.data.quiz.answered }), { put: 4, row: 40 });
  await s.expect("…but it is saved locally", () => saved(A), SEED_C);

  // ---- Turn on again: a brand-new code, a brand-new row
  await u.turnOn.click();
  await s.expect("turning on again mints a new code and seeds it with the local progress", async () => ({ chip: await u.chip.textContent(), row: (await d1.get(code2)).body.data, old: (await d1.get(code)).body.data.quiz.answered }), { chip: code2, row: SEED_C, old: 40 });

  // ---- phone
  const P = await s.device({ seed: SEED, phone: true });
  await P.openMe();
  await ui(P.page).turnOn.tap();
  await s.expect("phone: sync turns on and settles", () => card(P.page).then((c) => c.title), "All changes synced");
  await s.expect("phone: the long code wraps inside the window", () => ui(P.page).chip.evaluate((e) => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }), true);
  await P.shot("sync-synced", { tall: true });
  await P.setDark(true);
  await P.shot("sync-synced", { tall: true });
  finish(s);
});

/* 4 ------------------------------------------------------------------ */
scenario("04-join", "join with a code: type it on device B, adopt A's progress, the confirm, the messages", async (s) => {
  const code = codeOf(4, "a", 1);
  const unknown = codeOf(4, "x", 1);
  const CONFIRM = "This device has progress. Connecting replaces it with the cloud copy — export first if you want to keep it. Continue?";
  const A = await s.device({ seed: SEED });
  await A.openMe();
  await ui(A.page).turnOn.click();
  await s.expect("device A has synced its progress under its code", async () => ({ chip: await ui(A.page).chip.textContent(), row: (await d1.get(code)).body.data }), { chip: code, row: SEED });
  const stamp = (await d1.get(code)).body.updatedAt;

  // ---- a fresh device B
  const B = await s.device({});
  await B.openMe();
  const u = ui(B.page);
  await s.expect("before joining: no code box", () => u.codeInput.count(), 0);
  await u.haveCode.click();
  await s.expect("I have a code opens a row: a labelled input and Connect", async () => ({
    input: await u.codeInput.evaluate((i) => ({ ph: i.placeholder, spell: i.spellcheck, cap: i.getAttribute("autocapitalize"), fix: i.getAttribute("autocorrect"), value: i.value })),
    connect: await u.connect.isDisabled(),
  }), { input: { ph: "Paste your sync code", spell: false, cap: "none", fix: "off", value: "" }, connect: false });
  await B.shot("join-input", { bottom: true });
  await u.haveCode.click();
  await s.expect("I have a code again folds it away", () => u.codeInput.count(), 0);
  await u.haveCode.click();

  await B.clearToasts();
  await u.connect.click();
  await s.expect("Connect with nothing typed: a nudge, no request", async () => ({ toasts: await B.toasts(), requests: B.net.count() }), { toasts: ["Paste the code from your other device first"], requests: 0 });
  await B.clearToasts();
  await u.codeInput.fill("abc");
  await u.connect.click();
  await s.expect("a malformed code (too short): 'That doesn't look like a sync code', nothing asked of the Worker, nothing saved", async () => ({
    toasts: await B.toasts(), requests: B.net.count(), cfg: await B.cfg(), kept: await u.codeInput.inputValue(),
  }), { toasts: ["That doesn't look like a sync code"], requests: 0, cfg: null, kept: "abc" });
  await B.clearToasts();
  await u.codeInput.fill("has spaces in it!!");
  await u.connect.click();
  await s.expect("…and so is one with characters a code never has", () => B.toasts(), ["That doesn't look like a sync code"]);

  // ---- a well-formed code nobody has used: this (empty) device seeds it
  await B.clearToasts();
  await u.codeInput.fill(unknown);
  await u.connect.click();
  await s.expect("a code with nothing under it: this device seeds the cloud ('Connected — this device seeded the cloud')", () => B.toasts(), ["* Connected — this device seeded the cloud"]);
  await s.expect("…the Worker now holds this device's (blank) progress under it, and the box has folded away", async () => ({ row: (await d1.get(unknown)).body.data, input: await u.codeInput.count(), chip: await u.chip.textContent() }), { row: BLANK, input: 0, chip: unknown });
  await B.answering(true, () => u.turnOff.click());

  // ---- A's code: the fresh device takes A's progress, no questions asked
  await u.haveCode.click();
  await B.clearToasts();
  const release = B.net.hold();
  await u.codeInput.fill(`  ${code}  `);
  const asked = await B.answering(true, () => u.connect.click());
  await s.expect("a device with no progress is not asked to confirm", () => asked, []);
  await s.expect("while it connects the panel is already the sync panel: the code row is gone, the card says Syncing…", async () => ({ input: await u.codeInput.count(), card: (await card(B.page)).title, chip: await u.chip.textContent() }), { input: 0, card: "Syncing…", chip: code });
  release();
  await s.expect("the code was trimmed and used; the box is gone and the card is up", async () => ({ chip: await u.chip.textContent(), input: await u.codeInput.count(), card: (await card(B.page)).title }), { chip: code, input: 0, card: "All changes synced" });
  await s.expect("exactly one gold toast: 'Progress synced from the cloud'", () => B.toasts(), ["* Progress synced from the cloud"]);
  await s.expect("B shows A's progress", () => stats(B.page), ["22/115 problems", "5/24 stations", "5/24 rituals", "134 cards", "75% accuracy", "6 best streak"]);
  await s.expect("B's config: this code, the cloud's stamp taken as both edited and acknowledged, no 'joining' flag left", () => B.cfg(), (c) => c.code === code && c.editedAt === stamp && c.serverAt === stamp && c.okAt > 0 && !("joining" in c));
  await s.expect("B saved the adopted progress, as it came", () => B.blob(), SEED);
  await s.expect("an adoption is not an edit: B asked for the row once and wrote nothing", async () => ({ get: B.net.count("GET", code), put: B.net.count("PUT", code), row: (await d1.get(code)).body.updatedAt === stamp }), { get: 1, put: 0, row: true });
  await s.expect("…and its card says synced just now", () => card(B.page), { title: "All changes synced", when: "Last synced just now", tone: "var(--green)", glyph: "cloud-check" });
  await B.advance(6000);
  await s.expect("…even after the debounce window nothing is pushed back", () => B.net.count("PUT"), 1 /* the blank seed of the unknown code */);
  await B.shot("joined", { bottom: true });
  await B.setDark(true);
  await B.shot("joined", { bottom: true });

  // ---- a device with progress is asked first
  const C = await s.device({ seed: SEED_B });
  await C.openMe();
  const cu = ui(C.page);
  await cu.haveCode.click();
  await cu.codeInput.fill(code);
  await C.clearToasts();
  const declined = await C.answering(false, () => cu.connect.click());
  await s.expect("a device with progress is warned: connecting replaces it with the cloud copy", () => declined, [`confirm: ${CONFIRM}`]);
  await s.expect("…declining does nothing: no request, no config, the code stays typed, its progress stays", async () => ({ requests: C.net.count(), cfg: await C.cfg(), kept: await cu.codeInput.inputValue(), stats: (await stats(C.page))[0], toasts: await C.toasts(), disabled: await cu.connect.isDisabled() }), { requests: 0, cfg: null, kept: code, stats: "8/115 problems", toasts: [], disabled: false });
  const accepted = await C.answering(true, () => cu.connect.click());
  await s.expect("…accepting asks once and goes ahead", () => accepted, [`confirm: ${CONFIRM}`]);
  await s.expect("…and C now has A's progress, replacing its own", async () => ({ toasts: await C.toasts(), stats: await stats(C.page), chip: await cu.chip.textContent() }), { toasts: ["* Progress synced from the cloud"], stats: ["22/115 problems", "5/24 stations", "5/24 rituals", "134 cards", "75% accuracy", "6 best streak"], chip: code });
  await s.expect("…saved locally too", () => C.blob(), SEED);
  await s.expect("…and the cloud copy is untouched", async () => ({ at: (await d1.get(code)).body.updatedAt === stamp, put: C.net.count("PUT") }), { at: true, put: 0 });

  // ---- phone
  const P = await s.device({ phone: true });
  await P.openMe();
  await ui(P.page).haveCode.tap();
  await ui(P.page).codeInput.fill(code);
  await s.expect("phone: the code box and Connect fit on one row inside the window", () => P.page.locator("main > section > .mrow").nth(1).evaluate((row) => [...row.children].every((e) => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }) && new Set([...row.children].map((e) => Math.round(e.getBoundingClientRect().top))).size === 1), true);
  await P.shot("join-input", { bottom: true });
  await ui(P.page).connect.tap();
  await s.expect("phone: joining works the same", async () => ({ title: (await card(P.page)).title, stats: (await stats(P.page))[0] }), { title: "All changes synced", stats: "22/115 problems" });
  await P.shot("joined", { tall: true });
  finish(s);
});

/* 5 ------------------------------------------------------------------ */
scenario("05-link-get", "link sheet, Get mode: A shows a code, B sends from its link, A's poll sees it, says Linked, closes", async (s) => {
  const code = codeOf(5, "a", 1);
  const A = await s.device({});
  await A.openMe();
  const u = ui(A.page);
  await s.expect("precondition: nothing in D1 under A's first code", async () => (await d1.get(code)).status, 404);
  await A.pause(); // before the click: the sheet's 2.5 s peek timer must start while time is held
  await u.link.click();
  await s.expect("the sheet is a modal dialog labelled 'Link a device'", () => sheet(A.page).evaluate((d) => ({ modal: d.getAttribute("aria-modal"), label: d.getAttribute("aria-label") })), { modal: "true", label: "Link a device" });
  await s.expect("a device with no progress opens in Get mode", async () => (await sheetState(A.page)).mode, ["Get progress:true", "Send progress:false"]);
  await s.expect("it shows its freshly minted code, the instruction, and that it is waiting", () => sheetState(A.page), {
    mode: ["Get progress:true", "Send progress:false"],
    code,
    hint: "Scan with the device that has your progress — it sends, this one receives.",
    warn: null,
    wait: "Waiting for the other device...",
    linked: null,
    sub: ["Scan a code instead"],
    paste: null,
    enable: [],
    qr: true,
  });
  await s.expect("the square is the link <origin>/#sync=<code>&do=send, white card with dark modules", () => qrCheck(A.page, linkOf(code, "send")), QR_OK(GET_LABEL));
  await s.expect("focus went to Close", () => A.page.evaluate(() => document.activeElement?.textContent), "Close");
  await s.expect("nothing is enabled or saved yet, and the Worker has no row for the code", async () => ({ cfg: await A.cfg(), row: (await d1.get(code)).status }), { cfg: null, row: 404 });
  await A.settle();
  await s.expect("it peeked at the code once on opening (a plain GET)", () => A.net.count("GET", code), 1);
  await A.advance(2400);
  await A.settle();
  await s.expect("2.4 s later: no second peek yet", () => A.net.count("GET", code), 1);
  await A.advance(100);
  await A.settle();
  await s.expect("at 2.5 s: the second peek", () => A.net.count("GET", code), 2);
  await A.advance(2500);
  await A.settle();
  await s.expect("then one every 2.5 s", () => A.net.count("GET", code), 3);
  await s.expect("the peeks never wrote anything and touched no state: still no config, no row", async () => ({ put: A.net.count("PUT"), cfg: await A.cfg(), row: (await d1.get(code)).status }), { put: 0, cfg: null, row: 404 });
  await A.shot("get-waiting");
  await A.setDark(true);
  await A.shot("get-waiting");
  await A.setDark(false);

  // ---- B, with progress, opens A's link
  const B = await s.device({ seed: SEED_B, clockOffset: 5_000 });
  await B.open(`#sync=${code}&do=send`);
  await s.expect("B lands on the Me tab with the consent card up", async () => ({ tab: await B.page.getByRole("navigation", { name: "Sections" }).getByRole("button", { name: "Me", exact: true }).getAttribute("aria-current"), cards: await B.page.locator(".linkcard").count() }), { tab: "page", cards: 1 });
  await s.expect("the card asks to send this device's progress, in its own numbers, to the code in the link", () => consent(B.page), {
    title: "Send this device's progress?",
    code,
    notes: ["This device's copy — 480 XP · 8 problems on Onsite Express — goes up under that code, and the two devices stay linked from there."],
    buttons: ["Send & link", "Cancel"],
  });
  await s.expect("the link was consumed: the address bar is back to the bare page", () => B.page.evaluate(() => location.href), "https://yalc.test/");
  await s.expect("nothing is acted on until the reader says yes: no request for that code, no config, no row", async () => ({ requests: B.net.count(null, code), cfg: await B.cfg(), row: (await d1.get(code)).status }), { requests: 0, cfg: null, row: 404 });
  await B.shot("consent-send", { bottom: true });
  await B.setDark(true);
  await B.shot("consent-send", { bottom: true });
  await B.setDark(false);
  await B.clearToasts();
  await B.page.getByRole("button", { name: "Send & link" }).click();
  await s.expect("accepting: a gold 'Progress sent — devices linked' and the card is gone", async () => ({ toasts: await B.toasts(), cards: await B.page.locator(".linkcard").count() }), { toasts: ["* Progress sent — devices linked"], cards: 0 });
  await s.expect("B is now syncing under A's code", async () => ({ chip: await ui(B.page).chip.textContent(), title: (await card(B.page)).title }), { chip: code, title: "All changes synced" });
  await s.expect("the Worker holds B's progress under A's code, one PUT and no pull", async () => { const r = await d1.get(code); return { data: r.body.data, at: r.body.updatedAt === (await B.cfg()).editedAt, put: B.net.count("PUT", code), get: B.net.count("GET", code) }; }, { data: SEED_B, at: true, put: 1, get: 0 });

  // ---- A notices, adopts, says Linked, and goes
  await A.page.evaluate((sel) => { window.__sheetNode = document.querySelector(sel); }, SHEET);
  const steps = await A.pump(async () => (await sheetState(A.page).catch(() => ({}))).linked === "Linked");
  await s.expect("A's very next peek sees the row: the sheet says Linked (one interval)", () => steps, 1);
  await s.expect("the Linked card stands where the square was: role=status, no toggle, no code", () => A.page.locator(`${SHEET} .qrlinked`).evaluate((e) => ({ role: e.getAttribute("role"), text: e.textContent, toggle: !!e.ownerDocument.querySelector(".segtoggle"), icon: !!e.querySelector("svg") })), { role: "status", text: "Linked", toggle: false, icon: true });
  await s.expect("it is the very same sheet that was open before (sync coming on flipped the panel behind it without remounting it)", () => A.page.evaluate((sel) => document.querySelector(sel) === window.__sheetNode, SHEET), true);
  await s.expect("A adopted B's progress: one gold toast, and the tiles changed", async () => ({ toasts: await A.toasts(), stats: await stats(A.page) }), { toasts: ["* Progress synced from the cloud"], stats: ["8/115 problems", "2/24 stations", "2/24 rituals", "40 cards", "70% accuracy", "3 best streak"] });
  await s.expect("A is syncing now, under the code it showed, level with the Worker", async () => { const c = await A.cfg(); const r = await d1.get(code); return { code: c.code, level: c.editedAt === r.body.updatedAt && c.serverAt === r.body.updatedAt, joining: c.joining ?? null }; }, { code, level: true, joining: null });
  await s.expect("A wrote nothing", () => A.net.count("PUT"), 0);
  await A.shot("get-linked");
  await A.advance(1100);
  await s.expect("1.1 s on: the Linked card is still up", () => sheet(A.page).count(), 1);
  await A.advance(100);
  await s.expect("at 1.2 s the sheet closes by itself", () => sheet(A.page).count(), 0);
  await s.expect("…focus is not restored (the button that opened it was replaced when sync came on): it falls back to the page", () => A.page.evaluate(() => document.activeElement?.tagName), "BODY");
  await s.expect("…and the panel behind shows the synced card with the same code", async () => ({ chip: await u.chip.textContent(), card: (await card(A.page)).title }), { chip: code, card: "All changes synced" });
  const gets = A.net.count("GET", code);
  await A.advance(20_000);
  await A.settle();
  await s.expect("the watch is over: no more peeks once it has closed", () => A.net.count("GET", code), gets);
  await A.resume();
  await s.expect("A's saved progress is B's", () => A.blob(), SEED_B);

  // ---- the sheet's own ways out, and its modes
  const C = await s.device({ name: "c" });
  await C.openMe();
  const cu = ui(C.page);
  const code1 = codeOf(5, "c", 1);
  await C.pause();
  await cu.link.click();
  await s.expect("a device that has not got a sheet open has no dialog; once opened, it mints one code per opening", async () => (await sheetState(C.page)).code, code1);
  await C.page.keyboard.press("Escape");
  await s.expect("Escape closes the sheet", () => sheet(C.page).count(), 0);
  await s.expect("…and puts focus back on the button that opened it", () => C.page.evaluate(() => document.activeElement?.textContent.trim()), "Link a device");
  const afterEsc = C.net.count("GET", code1);
  await C.advance(10_000);
  await C.settle();
  await s.expect("…and stops watching: no peek after closing", () => C.net.count("GET", code1), afterEsc);
  await C.resume();
  await cu.link.click();
  await s.expect("opening again shows a different code (a code per opening)", async () => (await sheetState(C.page)).code, codeOf(5, "c", 2));
  await C.page.mouse.move(4, 4);
  await C.page.mouse.down();
  await C.page.mouse.up();
  await s.expect("a press on the dark scrim closes it", () => sheet(C.page).count(), 0);
  await cu.link.click();
  await C.page.locator(`${SHEET} .qrhint`).click();
  await s.expect("a press on the card itself does not", () => sheet(C.page).count(), 1);
  await C.page.getByRole("button", { name: "Send progress" }).click();
  await s.expect("Send mode with sync off and no progress has no square: it offers to turn sync on", async () => { const st = await sheetState(C.page); return { mode: st.mode, qr: st.qr, enable: st.enable, wait: st.wait, paste: st.paste }; }, { mode: ["Get progress:false", "Send progress:true"], qr: false, enable: ["Turn on sync & show the code"], wait: null, paste: "Or paste a code or link" });
  await C.page.getByRole("button", { name: "Get progress" }).click();
  await s.expect("back in Get mode it is the same square as before (the code is minted once per opening)", async () => (await sheetState(C.page)).code, codeOf(5, "c", 3));
  await C.page.getByRole("button", { name: "Close", exact: true }).click();
  await s.expect("Close closes", () => sheet(C.page).count(), 0);

  // ---- Get mode on a device that has progress: told what will be replaced
  const E = await s.device({ seed: SEED, name: "e" });
  await E.openMe();
  await ui(E.page).link.click();
  await E.page.getByRole("button", { name: "Get progress" }).click();
  await s.expect("Get mode on a device with progress (sync off) warns that what arrives replaces it", async () => { const st = await sheetState(E.page); return { warn: st.warn, wait: st.wait, code: st.code }; }, { warn: "This device has progress. What arrives replaces it — export first if it's worth keeping.", wait: "Waiting for the other device...", code: codeOf(5, "e", 1) });
  await E.shot("get-warn");

  // ---- Get mode on a device that is already syncing: its own pushes are not "the other device"
  const dcode = codeOf(5, "d", 1);
  const D = await s.device({ seed: SEED, name: "d" });
  await D.openMe();
  await D.pause();
  await ui(D.page).turnOn.click();
  await D.settle();
  await s.expect("D syncs under its own code", async () => ({ chip: await ui(D.page).chip.textContent(), title: (await card(D.page)).title }), { chip: dcode, title: "All changes synced" });
  const s0 = (await d1.get(dcode)).body.updatedAt;
  await edit(D, SEED_B);
  await ui(D.page).link.click();
  await D.page.getByRole("button", { name: "Get progress" }).click();
  await D.settle();
  await s.expect("with sync on the sheet shows D's own code, with the stronger warning", async () => { const st = await sheetState(D.page); return { code: st.code, warn: st.warn }; }, { code: dcode, warn: "What arrives replaces the progress here — and on every device already on this code. Export first if it's worth keeping." });
  await D.advance(4_000);
  await D.settle();
  const own = (await d1.get(dcode)).body;
  await s.expect("D's own debounced push moves the row while the sheet is open", () => ({ xp: own.data.tracks.google.xp, newer: own.updatedAt > s0 }), { xp: 480, newer: true });
  await D.advance(2_500);
  await D.settle();
  await s.expect("the next peek sees a newer row but one D has been credited for: that is not the other device (no Linked, still waiting)", async () => { const st = await sheetState(D.page); return { linked: st.linked, wait: st.wait }; }, { linked: null, wait: "Waiting for the other device..." });
  await d1.put(dcode, own.updatedAt + 10_000, SEED_C);
  await D.clearToasts();
  const dsteps = await D.pump(async () => (await sheetState(D.page).catch(() => ({}))).linked === "Linked");
  await s.expect("a newer row nobody here wrote is: the sheet says Linked within one peek", () => dsteps, 1);
  await s.expect("D, already on that code, adopts it in place: one gold toast, same code, level with the Worker, only its own two PUTs", async () => ({ toasts: await D.toasts(), stats: (await stats(D.page))[0], cfg: await (async () => { const c = await D.cfg(); return { code: c.code, level: c.editedAt === own.updatedAt + 10_000 && c.serverAt === own.updatedAt + 10_000 }; })(), put: D.net.count("PUT") }), { toasts: ["* Progress synced from the cloud"], stats: "10/115 problems", cfg: { code: dcode, level: true }, put: 2 });
  finish(s);
});

/* 6 ------------------------------------------------------------------ */
scenario("06-link-send", "link sheet, Send mode: A turns sync on and shows a code, B adopts it from the link; the paste row", async (s) => {
  const code = codeOf(6, "a", 2); // the sheet mints one on opening; Turn on sync mints the one that is kept
  const A = await s.device({ seed: SEED });
  await A.openMe();
  const u = ui(A.page);
  await u.link.click();
  await s.expect("a device with progress opens in Send mode", async () => (await sheetState(A.page)).mode, ["Get progress:false", "Send progress:true"]);
  await s.expect("with sync off there is no square yet: a hint, a button, the paste row and the scanner", () => sheetState(A.page), {
    mode: ["Get progress:false", "Send progress:true"],
    code: null,
    hint: "Two ways round: turn sync on and hold up a code of your own, or send to the code the other device is already showing.",
    warn: null,
    wait: null,
    linked: null,
    sub: ["Send to a code", "Scan a code instead"],
    paste: "Or paste a code or link",
    enable: ["Turn on sync & show the code"],
    qr: false,
  });
  await A.shot("send-off");
  await A.clearToasts();
  await A.page.getByRole("button", { name: "Turn on sync & show the code" }).click();
  await s.expect("turning sync on from the sheet shows the square (no toast: the square is the receipt)", async () => ({ st: await sheetState(A.page), toasts: await A.toasts() }), (v) => v.toasts.length === 0 && v.st.qr && v.st.code === code && v.st.enable.length === 0);
  await s.expect("the sheet is still the same sheet, still in Send mode, with the hint for it", async () => { const st = await sheetState(A.page); return { mode: st.mode, hint: st.hint, wait: st.wait, warn: st.warn, sub: st.sub }; }, {
    mode: ["Get progress:false", "Send progress:true"],
    hint: "Scan with the device you want to link — it adopts the progress on this one.",
    wait: null,
    warn: null,
    sub: ["Send to a code", "Scan a code instead"],
  });
  await s.expect("the square is <origin>/#sync=<code>&do=recv", () => qrCheck(A.page, linkOf(code, "recv")), QR_OK(SEND_LABEL));
  await s.expect("the Worker got A's progress under that code", async () => (await d1.get(code)).body.data, SEED);
  await A.shot("send-code");
  await A.setDark(true);
  await A.shot("send-code");
  await A.setDark(false);

  // ---- B, fresh, opens the link
  const B = await s.device({});
  await B.open(`#sync=${code}&do=recv`);
  await s.expect("B's consent card offers to adopt, and says what is replaced (nothing)", () => consent(B.page), {
    title: "Adopt the progress under this code?",
    code,
    notes: ["This device connects to that code and takes the cloud copy. What's here now — no XP, no problems — is replaced, so export first if it's worth keeping."],
    buttons: ["Connect & adopt", "Cancel"],
  });
  await B.shot("consent-adopt", { bottom: true });
  await B.clearToasts();
  await B.page.getByRole("button", { name: "Connect & adopt" }).click();
  await s.expect("accepting adopts A's progress: one gold toast and the card is gone", async () => ({ toasts: await B.toasts(), cards: await B.page.locator(".linkcard").count(), stats: await stats(B.page) }), { toasts: ["* Progress synced from the cloud"], cards: 0, stats: ["22/115 problems", "5/24 stations", "5/24 rituals", "134 cards", "75% accuracy", "6 best streak"] });
  await s.expect("B is syncing under A's code and wrote nothing", async () => ({ cfg: (await B.cfg()).code, put: B.net.count("PUT"), blob: await B.blob() }), { cfg: code, put: 0, blob: SEED });

  // ---- modes with sync on
  await A.page.getByRole("button", { name: "Get progress" }).click();
  await s.expect("with sync on, Get mode shows the same code as a do=send link, the stronger warning, and waits", () => sheetState(A.page), {
    mode: ["Get progress:true", "Send progress:false"],
    code,
    hint: "Scan with the device that has your progress — it sends, this one receives.",
    warn: "What arrives replaces the progress here — and on every device already on this code. Export first if it's worth keeping.",
    wait: "Waiting for the other device...",
    linked: null,
    sub: ["Scan a code instead"],
    paste: null,
    enable: [],
    qr: true,
  });
  await s.expect("…the square changed to the do=send link", () => qrCheck(A.page, linkOf(code, "send")), QR_OK(GET_LABEL));
  await A.shot("get-synced");
  await A.page.getByRole("button", { name: "Send progress" }).click();

  // ---- the paste row
  const box = A.page.getByLabel("Code to send this device's progress to");
  await A.clearToasts();
  await box.fill("xyz");
  await A.page.getByRole("button", { name: "Send to a code" }).click();
  await s.expect("Send to a code with junk: 'That doesn't look like a sync code'; the sheet stays", async () => ({ toasts: await A.toasts(), open: await sheet(A.page).count(), kept: await box.inputValue() }), { toasts: ["That doesn't look like a sync code"], open: 1, kept: "xyz" });
  const other = codeOf(6, "z", 1);
  await box.fill(`  https://elsewhere.example/app/#sync=${other}&do=recv  `);
  await A.page.getByRole("button", { name: "Send to a code" }).click();
  await s.expect("a pasted link, from any origin, even one that says do=recv, becomes a *send* consent card — and the sheet gives way to it", async () => ({ open: await sheet(A.page).count(), card: await consent(A.page) }), {
    open: 0,
    card: {
      title: "Send this device's progress?",
      code: other,
      notes: [
        "This device's copy — 1240 XP · 22 problems on Onsite Express, 70 XP · 3 on Day One Local — goes up under that code, and the two devices stay linked from there.",
        "This device syncs under another code today; accepting moves it to this one.",
      ],
      buttons: ["Send & link", "Cancel"],
    },
  });
  await s.expect("…and nothing has been sent to it yet", async () => ({ requests: A.net.count(null, other), row: (await d1.get(other)).status }), { requests: 0, row: 404 });
  await A.shot("consent-switch", { bottom: true });
  finish(s);
});

/* 7 ------------------------------------------------------------------ */
scenario("07-consent", "consent card variants: bad links, nothing to send, switching codes, re-scans, decline", async (s) => {
  const nav = (page, name) => page.getByRole("navigation", { name: "Sections" }).getByRole("button", { name, exact: true });
  const SWITCH = "This device syncs under another code today; accepting moves it to this one.";
  const NOTHING = "Nothing here to send? If your progress lives in the copy you added to your home screen, open that one and scan from there — it keeps its own storage.";
  const tabOf = (page) => page.locator("nav.tabs button[aria-current=page]").textContent().then((t) => t.trim());

  // ---- links that are not offers
  const V = await s.device({});
  const bad = "#sync=short&do=recv";
  await V.open(bad);
  await s.expect("a link whose code is too short is not an offer: no card, still on the Line, address untouched", async () => ({ cards: await V.page.locator(".linkcard").count(), tab: await tabOf(V.page), hash: await V.page.evaluate(() => location.hash) }), { cards: 0, tab: "Line", hash: bad });
  await V.page.evaluate(() => (location.hash = "#hello"));
  await s.expect("a fragment that is not ours is left alone too", async () => ({ cards: await V.page.locator(".linkcard").count(), hash: await V.page.evaluate(() => location.hash) }), { cards: 0, hash: "#hello" });
  const W = codeOf(7, "w", 1);
  await V.page.evaluate((c) => (location.hash = `#sync=${c}&do=weird`), W);
  await s.expect("an unknown verb reads as 'receive': the adopt card, and the reader is taken to the Me tab", async () => ({ tab: await tabOf(V.page), title: (await consent(V.page)).title, hash: await V.page.evaluate(() => location.hash) }), { tab: "Me", title: "Adopt the progress under this code?", hash: "" });
  await s.expect("the card is a plain card in the page, not a dialog", () => V.page.locator(".linkcard").evaluate((c) => ({ role: c.getAttribute("role"), position: getComputedStyle(c).position, modal: !!document.querySelector("[aria-modal=true]") })), { role: null, position: "static", modal: false });
  await V.page.getByRole("button", { name: "Cancel" }).click();
  await V.page.evaluate((c) => (location.hash = `#sync=${c}`), W);
  await s.expect("a bare #sync=<code> is 'receive' as well", async () => (await consent(V.page)).title, "Adopt the progress under this code?");
  const W2 = codeOf(7, "w", 2);
  await V.page.evaluate((c) => (location.hash = `#sync=${c}&do=send`), W2);
  await s.expect("a second link while one is waiting replaces it", async () => { const c = await consent(V.page); return [c.title, c.code]; }, ["Send this device's progress?", W2]);
  await s.expect("nothing was asked of the Worker by any of this", () => V.net.count(), 0);

  // ---- nothing to send
  const X = codeOf(7, "x", 1);
  const E = await s.device({});
  await E.open(`#sync=${X}&do=send`);
  await s.expect("a device with nothing is told so, and where its progress may be instead", () => consent(E.page), {
    title: "Send this device's progress?",
    code: X,
    notes: ["This device's copy — no XP, no problems — goes up under that code, and the two devices stay linked from there.", NOTHING],
    buttons: ["Send & link", "Cancel"],
  });
  await E.shot("consent-empty", { bottom: true });
  await E.clearToasts();
  await E.page.getByRole("button", { name: "Cancel" }).click();
  await s.expect("Cancel: the card goes, with no toast, no request, no config, no row", async () => ({ cards: await E.page.locator(".linkcard").count(), toasts: await E.toasts(), requests: E.net.count(), cfg: await E.cfg(), row: (await d1.get(X)).status }), { cards: 0, toasts: [], requests: 0, cfg: null, row: 404 });

  // ---- switching codes
  const Y = codeOf(7, "y", 1);
  const Z = codeOf(7, "z", 1);
  const own = codeOf(7, "s", 1);
  await d1.put(Y, T0 + 1_000, SEED_B);
  const S = await s.device({ seed: SEED, name: "s" });
  await S.openMe();
  await ui(S.page).turnOn.click();
  await s.expect("S syncs under its own code", async () => ({ chip: await ui(S.page).chip.textContent(), row: (await d1.get(own)).body.data }), { chip: own, row: SEED });
  const editedAt = (await S.cfg()).editedAt;
  await nav(S.page, "Line").click();
  await S.page.evaluate((c) => (location.hash = `#sync=${c}&do=recv`), Y);
  await s.expect("a link pasted into the open tab walks the reader from the Line to the Me tab and asks there", async () => ({ tab: await tabOf(S.page), card: await consent(S.page) }), {
    tab: "Me",
    card: {
      title: "Adopt the progress under this code?",
      code: Y,
      notes: [
        "This device connects to that code and takes the cloud copy. What's here now — 1240 XP · 22 problems on Onsite Express, 70 XP · 3 on Day One Local — is replaced, so export first if it's worth keeping.",
        SWITCH,
      ],
      buttons: ["Connect & adopt", "Cancel"],
    },
  });
  await S.shot("consent-switch", { bottom: true });
  await S.clearToasts();
  await S.page.getByRole("button", { name: "Cancel" }).click();
  await s.expect("Cancel: still under its own code, nothing asked of the other code, its row untouched", async () => ({ cards: await S.page.locator(".linkcard").count(), toasts: await S.toasts(), cfg: (await S.cfg()).code, asked: S.net.count(null, Y), other: (await d1.get(Y)).body.data.quiz.answered }), { cards: 0, toasts: [], cfg: own, asked: 0, other: 40 });
  await S.page.evaluate((c) => (location.hash = `#sync=${c}&do=recv`), Y);
  const release = S.net.hold();
  await S.page.getByRole("button", { name: "Connect & adopt" }).click();
  await s.expect("while the answer is awaited both buttons are disabled", () => consent(S.page).then((c) => c.buttons), ["Connect & adopt (disabled)", "Cancel (disabled)"]);
  release();
  await s.expect("accepting moves S to the other code and adopts its progress (one gold toast)", async () => ({ toasts: await S.toasts(), cfg: (await S.cfg()).code, chip: await ui(S.page).chip.textContent(), cards: await S.page.locator(".linkcard").count(), stats: (await stats(S.page))[0] }), { toasts: ["* Progress synced from the cloud"], cfg: Y, chip: Y, cards: 0, stats: "8/115 problems" });
  await s.expect("…its old row stays where it was, untouched", async () => ({ data: (await d1.get(own)).body.data, put: S.net.count("PUT", own) }), { data: SEED, put: 1 });
  // a send to a third code while on Y
  await S.page.evaluate((c) => (location.hash = `#sync=${c}&do=send`), Z);
  await s.expect("a 'send' card from a device that syncs elsewhere warns about switching too, in this device's current numbers", async () => (await consent(S.page)).notes, [
    "This device's copy — 480 XP · 8 problems on Onsite Express — goes up under that code, and the two devices stay linked from there.",
    SWITCH,
  ]);
  await S.clearToasts();
  await S.page.getByRole("button", { name: "Send & link" }).click();
  await s.expect("accepting sends this device's progress to the third code and moves there", async () => ({ toasts: await S.toasts(), cfg: (await S.cfg()).code, row: (await d1.get(Z)).body.data }), { toasts: ["* Progress sent — devices linked"], cfg: Z, row: SEED_B });

  // ---- scanning one's own code again
  const R = await s.device({ seed: SEED, name: "r" });
  await R.openMe();
  await ui(R.page).turnOn.click();
  const rcode = codeOf(7, "r", 1);
  await s.expect("R syncs under its code, and is level with the Worker", async () => ({ code: (await R.cfg()).code, title: (await card(R.page)).title }), { code: rcode, title: "All changes synced" });
  const before = await R.cfg();
  const putsBefore = R.net.count("PUT");
  await R.page.evaluate((c) => (location.hash = `#sync=${c}&do=send`), rcode);
  await s.expect("a 'send' link to the code R is already on is not a switch", async () => (await consent(R.page)).notes, ["This device's copy — 1240 XP · 22 problems on Onsite Express, 70 XP · 3 on Day One Local — goes up under that code, and the two devices stay linked from there."]);
  await R.clearToasts();
  await R.page.getByRole("button", { name: "Send & link" }).click();
  await s.expect("accepting only reconciles: a plain 'Already in sync', no reseed, same stamps, no new PUT", async () => ({ toasts: await R.toasts(), cfg: await R.cfg(), puts: R.net.count("PUT") - putsBefore }), (v) => v.toasts.length === 1 && v.toasts[0] === "Already in sync" && v.cfg.editedAt === before.editedAt && v.cfg.serverAt === before.serverAt && v.puts === 0);
  await R.page.evaluate((c) => (location.hash = `#sync=${c}&do=recv`), rcode);
  await R.clearToasts();
  await R.page.getByRole("button", { name: "Connect & adopt" }).click();
  await s.expect("a 'receive' link to its own code re-adopts the cloud copy (same data, so nothing visibly changes)", async () => ({ toasts: await R.toasts(), stats: (await stats(R.page))[0], cfg: (await R.cfg()).code }), { toasts: ["* Progress synced from the cloud"], stats: "22/115 problems", cfg: rcode });
  finish(s);
});

/* 8 ------------------------------------------------------------------ */
scenario("08-scanner", "the in-app scanner: a fake camera showing a real QR, both decoders, a foreign QR, denied, no camera, Cancel", async (s) => {
  const X = codeOf(8, "x", 1);
  const dir = s.tmp();
  writeQrClip(path.join(dir, "ours.y4m"), linkOf(X, "send"));
  writeQrClip(path.join(dir, "foreign.y4m"), "https://example.org/some/other/page?x=1");
  const fakeCamera = (clip) => ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", `--use-file-for-fake-video-capture=${path.join(dir, clip)}`];
  const ours = await s.launch(fakeCamera("ours.y4m"));
  const foreign = await s.launch(fakeCamera("foreign.y4m"));
  const SCAN = '[role=dialog][aria-label="Scan a linking code"]';
  const scanner = (page) => page.locator(SCAN).evaluate((d) => ({ note: d.querySelector(".scannote").textContent, role: d.querySelector(".scannote").getAttribute("role"), video: !!d.querySelector("video.scanvid"), buttons: [...d.querySelectorAll("button")].map((b) => b.textContent) }));
  const cam = (page) => page.evaluate(() => ({ calls: window.__cam.calls, tracks: window.__cam.streams.flatMap((st) => st.getTracks().map((t) => t.readyState)), made: window.__bd.made, detects: window.__bd.detects }));
  const frameIn = (page) => page.locator(`${SCAN} video`).evaluate((v) => new Promise((r) => (v.readyState >= 2 && v.videoWidth ? r(`${v.videoWidth}x${v.videoHeight}`) : v.addEventListener("loadeddata", () => r(`${v.videoWidth}x${v.videoHeight}`), { once: true }))));
  const HINT = "Point the camera at the code on the other device.";
  /* Open the sheet, hold the clock, hand over to the camera; wait for its first frame unless told it will not come. */
  const openScanner = async (D, { frame = true } = {}) => {
    await ui(D.page).link.click();
    await D.pause();
    await D.page.getByRole("button", { name: "Scan a code instead" }).click();
    await D.page.locator(SCAN).waitFor();
    if (frame) await frameIn(D.page);
  };
  const SEND_CARD = {
    title: "Send this device's progress?",
    code: X,
    notes: ["This device's copy — 480 XP · 8 problems on Onsite Express — goes up under that code, and the two devices stay linked from there."],
    buttons: ["Send & link", "Cancel"],
  };

  // ---- jsQR reads the camera (no BarcodeDetector)
  const A = await s.device({ seed: SEED_B, browser: ours, camera: { detector: "absent" } });
  await A.openMe();
  await openScanner(A);
  await s.expect("Scan a code instead hands the screen to the camera: the sheet is gone, the scanner dialog is up", async () => ({ sheet: await sheet(A.page).count(), scan: await A.page.locator(SCAN).count() }), { sheet: 0, scan: 1 });
  await s.expect("the scanner: the hint, a status line, a Cancel button and a live video", () => scanner(A.page), { note: HINT, role: "status", video: true, buttons: ["Cancel"] });
  await s.expect("the video is the camera's: autoplay, muted, inline", () => A.page.locator(`${SCAN} video`).evaluate((v) => ({ autoplay: v.autoplay, muted: v.muted, inline: v.hasAttribute("playsinline"), live: !!v.srcObject })), { autoplay: true, muted: true, inline: true, live: true });
  await s.expect("it asked for the back camera, once", async () => (await cam(A.page)).calls, [{ video: { facingMode: "environment" } }]);
  await s.expect("a frame from the (fake) camera arrived, 640x480", () => frameIn(A.page), "640x480");
  await s.expect("the camera is on: its one track is live", async () => (await cam(A.page)).tracks, ["live"]);
  await A.shot("scanner-hint");
  const steps = await A.pump(async () => (await A.page.locator(".linkcard").count()) === 1, { step: 250, max: 12 });
  await s.expect("the QR on the camera is read on a tick of the scan loop and the consent card is up", () => steps >= 1, true);
  await s.expect("the card is the send card for the code in the QR, in this device's numbers", () => consent(A.page), SEND_CARD);
  await s.expect("the scanner closed itself and switched the camera off", async () => ({ scan: await A.page.locator(SCAN).count(), tracks: (await cam(A.page)).tracks }), { scan: 0, tracks: ["ended"] });
  await s.expect("jsQR did the reading (no BarcodeDetector was constructed)", async () => { const c = await cam(A.page); return { made: c.made, detects: c.detects }; }, { made: [], detects: 0 });
  await s.expect("the reader is on the Me tab, and nothing has been sent anywhere yet", async () => ({ tab: await A.page.locator("nav.tabs button[aria-current=page]").textContent(), requests: A.net.count(null, X) }), { tab: "Me", requests: 0 });
  await A.resume();

  // ---- the browser's own BarcodeDetector, when it exists
  const B = await s.device({ seed: SEED_B, browser: ours, camera: { detector: "fake" } });
  await B.openMe();
  await openScanner(B);
  await B.pump(async () => (await B.page.locator(".linkcard").count()) === 1, { step: 250, max: 12 });
  await s.expect("with a BarcodeDetector present it is the one used: built once for qr_code only, asked at least once", async () => { const c = await cam(B.page); return { made: c.made, asked: c.detects >= 1 }; }, { made: [{ formats: ["qr_code"] }], asked: true });
  await s.expect("…and the QR it read lands on the same consent card, the camera off", async () => ({ card: await consent(B.page), tracks: (await cam(B.page)).tracks }), { card: SEND_CARD, tracks: ["ended"] });
  const C = await s.device({ seed: SEED_B, browser: ours, camera: { detector: "throws" } });
  await C.openMe();
  await openScanner(C);
  await C.pump(async () => (await C.page.locator(".linkcard").count()) === 1, { step: 250, max: 12 });
  await s.expect("a BarcodeDetector whose constructor throws is one more browser for jsQR: the scan still lands on the card", async () => ({ card: (await consent(C.page)).code }), { card: X });

  // ---- a QR that is not this app's
  const F = await s.device({ seed: SEED_B, browser: foreign, camera: { detector: "absent" } });
  await F.openMe();
  await openScanner(F);
  await F.resume();
  await s.expect("a QR for some other page: 'That code isn't one of this app's — still looking.'", async () => (await scanner(F.page)).note, "That code isn't one of this app's — still looking.");
  await F.pause();
  await s.expect("…and the scanner stays open and the camera on, no card", async () => ({ scan: await F.page.locator(SCAN).count(), cards: await F.page.locator(".linkcard").count(), tracks: (await cam(F.page)).tracks }), { scan: 1, cards: 0, tracks: ["live"] });
  await F.shot("scanner-foreign");
  await F.page.getByRole("button", { name: "Cancel" }).click();
  await s.expect("Cancel closes the scanner and the camera goes off", async () => ({ scan: await F.page.locator(SCAN).count(), tracks: (await cam(F.page)).tracks, sheet: await sheet(F.page).count(), cards: await F.page.locator(".linkcard").count() }), { scan: 0, tracks: ["ended"], sheet: 0, cards: 0 });
  // the "still looking" line gives way to the hint again after 2.2 s, when what was seen goes away
  const G = await s.device({ seed: SEED_B, browser: ours, camera: { detector: "fake", foreignOnce: true } });
  await G.openMe();
  await openScanner(G);
  await G.advance(250);
  await G.settle();
  await s.expect("a detector that saw something foreign once: the 'still looking' line shows", async () => (await scanner(G.page)).note, "That code isn't one of this app's — still looking.");
  await G.advance(2000);
  await G.settle();
  await s.expect("2 s on it is still there", async () => (await scanner(G.page)).note, "That code isn't one of this app's — still looking.");
  await G.advance(500);
  await G.settle();
  await s.expect("after 2.2 s the hint comes back", async () => (await scanner(G.page)).note, HINT);
  await G.page.getByRole("button", { name: "Cancel" }).click();

  // ---- Cancel with the camera running
  const H = await s.device({ seed: SEED_B, browser: ours, camera: { detector: "absent" } });
  await H.openMe();
  await openScanner(H);
  await H.page.getByRole("button", { name: "Cancel" }).click();
  await s.expect("Cancel while looking: the scanner is gone, the camera's track is ended (the light is off), nothing was read", async () => ({ scan: await H.page.locator(SCAN).count(), tracks: (await cam(H.page)).tracks, cards: await H.page.locator(".linkcard").count(), sheet: await sheet(H.page).count() }), { scan: 0, tracks: ["ended"], cards: 0, sheet: 0 });
  await H.advance(2000);
  await s.expect("…and the scan loop is dead: time passing finds no card", () => H.page.locator(".linkcard").count(), 0);

  // ---- Cancel while the permission prompt is still up
  const J = await s.device({ seed: SEED_B, browser: ours, camera: { detector: "absent", mode: "hold" } });
  await J.openMe();
  await openScanner(J, { frame: false });
  await J.page.getByRole("button", { name: "Cancel" }).click();
  await J.page.evaluate(() => window.__camRelease());
  await s.expect("a camera that is granted after Cancel is switched straight off", async () => (await cam(J.page)).tracks, ["ended"]);

  // ---- the camera is refused
  const D = await s.device({ seed: SEED_B, camera: { mode: "denied" } });
  await D.openMe();
  await openScanner(D, { frame: false });
  await s.expect("permission denied: 'Camera access is off — type the code in instead.', no video, only Cancel", () => scanner(D.page), { note: "Camera access is off — type the code in instead.", role: "status", video: false, buttons: ["Cancel"] });
  await s.expect("…it asked once and gave up (no second try after a refusal)", async () => (await cam(D.page)).calls, [{ video: { facingMode: "environment" } }]);
  await D.shot("scanner-denied");
  await D.page.getByRole("button", { name: "Cancel" }).click();
  await s.expect("…Cancel closes it", () => D.page.locator(SCAN).count(), 0);
  const N = await s.device({ seed: SEED_B, camera: { mode: "notfound" } });
  await N.openMe();
  await openScanner(N, { frame: false });
  await s.expect("no camera at all: 'No camera here — type the code in instead.' after trying again with any camera", async () => ({ note: (await scanner(N.page)).note, calls: (await cam(N.page)).calls }), { note: "No camera here — type the code in instead.", calls: [{ video: { facingMode: "environment" } }, { video: true }] });
  const O = await s.device({ seed: SEED_B, browser: ours, camera: { mode: "overconstrained", detector: "absent" } });
  await O.openMe();
  await openScanner(O);
  await s.expect("a browser that refuses the 'environment' constraint is asked again for any camera, and then works", async () => ({ calls: (await cam(O.page)).calls, video: (await scanner(O.page)).video, tracks: (await cam(O.page)).tracks }), { calls: [{ video: { facingMode: "environment" } }, { video: true }], video: true, tracks: ["live"] });
  await O.pump(async () => (await O.page.locator(".linkcard").count()) === 1, { step: 250, max: 12 });
  await s.expect("…and the scan then lands on the card", async () => (await consent(O.page)).code, X);
  // a browser that really has no permission (nothing granted, no fake prompt)
  const plain = await s.launch([]);
  const R = await s.device({ seed: SEED_B, browser: plain });
  await R.openMe();
  await ui(R.page).link.click();
  await R.page.getByRole("button", { name: "Scan a code instead" }).click();
  await s.expect("a real browser with no camera permission and no camera ends on one of the two messages, the video not shown", async () => { const sc = await scanner(R.page); return { ok: /^(Camera access is off|No camera here) — type the code in instead\.$/.test(sc.note), video: sc.video }; }, { ok: true, video: false });

  // ---- phone
  const P = await s.device({ seed: SEED_B, phone: true, browser: ours, camera: { detector: "absent" } });
  await P.openMe();
  await ui(P.page).link.tap();
  await P.pause();
  await P.page.getByRole("button", { name: "Scan a code instead" }).tap();
  await P.page.locator(SCAN).waitFor();
  await frameIn(P.page);
  await s.expect("phone: the scanner covers the whole window, the video inside it, Cancel reachable", () => P.page.locator(SCAN).evaluate((d) => { const r = d.getBoundingClientRect(); const v = d.querySelector("video").getBoundingClientRect(); const b = d.querySelector("button").getBoundingClientRect(); return { cover: [r.x, r.y, r.width, r.height], videoInside: v.left >= 0 && v.right <= innerWidth, cancelInside: b.bottom <= innerHeight && b.top >= 0 }; }), { cover: [0, 0, 390, 844], videoInside: true, cancelInside: true });
  await P.shot("scanner");
  await P.pump(async () => (await P.page.locator(".linkcard").count()) === 1, { step: 250, max: 12 });
  await P.shot("scanned-consent", { bottom: true });
  finish(s);
});

/* 9 ------------------------------------------------------------------ */
scenario("09-lww", "two devices on one code: flush on hide, pull on wake and Sync now, last write wins by stamp", async (s) => {
  const code = codeOf(9, "a", 1);
  const holds = async (D, blob) => JSON.stringify(canonOf(await saved(D))) === JSON.stringify(canonOf(blob));
  const row = async () => (await d1.get(code)).body;
  const A = await s.device({ seed: SEED });
  await A.openMe();
  await ui(A.page).turnOn.click();
  await s.expect("A has seeded the code", async () => ({ title: (await card(A.page)).title, data: (await row()).data }), { title: "All changes synced", data: SEED });
  // B's clock runs ten minutes ahead of A's: its edits carry later stamps than anything A does within the scenario's first minutes
  const B = await s.device({ clockOffset: 600_000 });
  await B.openMe();
  await ui(B.page).haveCode.click();
  await ui(B.page).codeInput.fill(code);
  await ui(B.page).connect.click();
  await s.expect("B has joined and holds A's progress", async () => ({ stats: (await stats(B.page))[0], title: (await card(B.page)).title }), { stats: "22/115 problems", title: "All changes synced" });

  // ---- a push that does not wait for the debounce: the tab going to the background
  await edit(A, SEED_B);
  await A.pause();
  await s.expect("A's edit is queued and, with time held, cannot go out by the debounce", async () => ({ title: (await card(A.page)).title, put: A.net.count("PUT") }), { title: "Changes queued", put: 1 });
  await s.expect("…and is not yet saved locally either (the save is debounced too)", async () => (await A.blob()) === null || (await A.blob()).tracks.google.xp === 1240, true);
  await A.hidden(true);
  await A.settle();
  await s.expect("the tab going to the background flushes both at once: the PUT is out and the progress is saved", async () => ({ put: A.net.count("PUT"), data: (await row()).data, saved: await holds(A, SEED_B) }), { put: 2, data: SEED_B, saved: true });
  await s.expect("…the card is synced", async () => (await card(A.page)).title, "All changes synced");
  const gets = A.net.count("GET");
  await A.hidden(false);
  await A.settle();
  await s.expect("coming back within 30 s of the last exchange does not pull again", () => A.net.count("GET"), gets);
  await edit(A, SEED_C);
  await A.pagehide();
  await A.settle();
  await s.expect("pagehide flushes too (iOS discarding the tab)", async () => ({ put: A.net.count("PUT"), data: (await row()).data, saved: await holds(A, SEED_C) }), { put: 3, data: SEED_C, saved: true });
  await A.resume();

  // ---- B pulls it: Sync now
  await B.clearToasts();
  await ui(B.page).syncNow.click();
  await s.expect("B's Sync now finds a newer copy and adopts it: one gold toast, no confirm, nothing pushed", async () => ({ toasts: await B.toasts(), stats: await stats(B.page), put: B.net.count("PUT"), dialogs: B.dialogs.length }), { toasts: ["* Progress synced from the cloud"], stats: ["10/115 problems", "2/24 stations", "2/24 rituals", "55 cards", "73% accuracy", "3 best streak"], put: 0, dialogs: 0 });
  await s.expect("B's stamps now equal the row's: it is level, not 'dirty'", async () => { const c = await B.cfg(); const r = await row(); return c.editedAt === r.updatedAt && c.serverAt === r.updatedAt; }, true);
  await s.expect("B's saved copy is the adopted one", () => B.blob().then((b) => canonOf(b)), canonOf(SEED_C));

  // ---- B pulls it: the tab coming back (throttled to one look per 30 s)
  await edit(A, SEED_B);
  await A.hidden(true);
  await A.settle();
  await A.hidden(false);
  await B.pause();
  const bGets = B.net.count("GET");
  await B.hidden(true);
  await B.hidden(false);
  await B.settle();
  await s.expect("B coming back to the tab right after its last exchange does not look (30 s throttle)", () => B.net.count("GET"), bGets);
  await B.advance(20_000);
  await B.hidden(true);
  await B.hidden(false);
  await B.settle();
  await s.expect("…nor 20 s later", () => B.net.count("GET"), bGets);
  await B.advance(11_000);
  await B.hidden(true);
  await B.hidden(false);
  await B.settle();
  await s.expect("after 30 s it does: one GET, and A's newer edit is adopted", async () => ({ get: B.net.count("GET") - bGets, stats: (await stats(B.page))[0], put: B.net.count("PUT") }), { get: 1, stats: "8/115 problems", put: 0 });
  await B.resume();

  // ---- a stale write loses, and the loser adopts the winner
  await edit(B, SEED_C);
  await B.hidden(true);
  await B.settle();
  await B.hidden(false);
  await s.expect("B (clock ahead) writes SEED_C: the Worker holds it under B's later stamp", async () => ({ data: (await row()).data, put: B.net.count("PUT") }), { data: SEED_C, put: 1 });
  const winner = await row();
  await edit(A, SEED);
  await A.clearToasts();
  await A.hidden(true);
  await A.settle();
  await A.hidden(false);
  await s.expect("A's later-in-time write carries an earlier stamp: the Worker keeps B's copy", async () => { const r = await row(); return { data: r.data, at: r.updatedAt === winner.updatedAt }; }, { data: SEED_C, at: true });
  await s.expect("…and the Worker handed it back: A adopts B's copy (one gold toast), its own edit is gone", async () => ({ toasts: await A.toasts(), stats: (await stats(A.page))[0], title: (await card(A.page)).title }), { toasts: ["* Progress synced from the cloud"], stats: "10/115 problems", title: "All changes synced" });
  await s.expect("A's stamps now equal the winner's, and its saved copy is the winner's", async () => { const c = await A.cfg(); return { level: c.editedAt === winner.updatedAt && c.serverAt === winner.updatedAt, saved: await holds(A, SEED_C) }; }, { level: true, saved: true });
  await A.shot("lww-loser", { bottom: true });

  // ---- offline edits: an older one loses on reconnect, a newer one wins
  await B.advance(5_000); // B's held clock has to move on, or its next stamp is only the previous one plus a millisecond
  await edit(B, SEED_B);
  await B.hidden(true);
  await B.settle();
  await B.hidden(false);
  await s.expect("B writes SEED_B", async () => (await row()).data, SEED_B);
  A.net.down = true;
  await edit(A, SEED);
  await A.advance(4500);
  await A.settle();
  await s.expect("A, offline, edits: its push fails and the card says the cloud is unreachable", async () => ({ title: (await card(A.page)).title, tone: (await card(A.page)).tone, note: await syncNote(A.page) }), { title: "Cloud unreachable", tone: "var(--red)", note: "Progress is safe on this device and will sync when it can." });
  A.net.down = false;
  await A.clearToasts();
  await ui(A.page).syncNow.click();
  await s.expect("back online, A's older offline edit loses to B's newer write: it adopts, and pushes nothing of its own", async () => ({ toasts: await A.toasts(), stats: (await stats(A.page))[0], data: (await row()).data }), { toasts: ["* Progress synced from the cloud"], stats: "8/115 problems", data: SEED_B });
  await A.jump(1_200_000);
  A.net.down = true;
  await edit(A, SEED_C);
  await A.advance(4500);
  await A.settle();
  A.net.down = false;
  await A.clearToasts();
  const putsBefore = A.net.count("PUT");
  await ui(A.page).syncNow.click();
  await s.expect("an offline edit with a later stamp than the cloud's wins: 'Pushed to the cloud', and the Worker has it", async () => ({ toasts: await A.toasts(), data: (await row()).data, puts: A.net.count("PUT") - putsBefore }), (v) => v.toasts.join() === "* Pushed to the cloud" && JSON.stringify(v.data) === JSON.stringify(SEED_C) && v.puts >= 1);
  await B.clearToasts();
  await ui(B.page).syncNow.click();
  await s.expect("and B, syncing, adopts it", async () => ({ toasts: await B.toasts(), stats: (await stats(B.page))[0] }), { toasts: ["* Progress synced from the cloud"], stats: "10/115 problems" });
  finish(s);
});

/* 10 ------------------------------------------------------------------ */
scenario("10-held", "a cloud copy this build cannot read: sync parks instead of overwriting; Turn off clears it", async (s) => {
  const H = codeOf(10, "h", 1);
  const L = codeOf(10, "l", 1);
  const CONFIRM = "This device has progress. Connecting replaces it with the cloud copy — export first if you want to keep it. Continue?";
  /* Stamped an hour before any device's clock, so that when a device writes to it only the schema guard can refuse. */
  await d1.put(H, T0 - 3_600_000, FUTURE);
  const held = await d1.get(H);
  await s.expect("a blob from a build that does not exist yet can be put in the Worker: it keeps its version and stamp", () => ({ status: held.status, v: held.body.v, at: held.body.updatedAt, data: held.body.data }), { status: 200, v: 3, at: T0 - 3_600_000, data: FUTURE });

  // ---- joining it from a device with progress
  const B = await s.device({ seed: SEED_B });
  await B.openMe();
  const u = ui(B.page);
  await u.haveCode.click();
  await u.codeInput.fill(H);
  await B.clearToasts();
  await B.answering(true, () => u.connect.click());
  await s.expect("Connect to the unreadable copy: no adoption; the toast says the cloud copy is from a newer app (not gold)", () => B.toasts(), ["The cloud copy is from a newer version of the app — reload to update"]);
  await s.expect("…the card parks in its own look: amber, a warning sign, 'Update needed', no 'last synced' line", () => card(B.page), { title: "Update needed", when: null, tone: "var(--med)", glyph: "alert-triangle" });
  await s.expect("…its note says to reload, and that this device leaves the copy alone", () => syncNote(B.page), "The cloud copy is from a newer version of the app. Reload to update; until then this device leaves it alone.");
  await s.expect("…B's own progress was not touched", async () => ({ stats: await stats(B.page), blob: await B.blob() }), { stats: ["8/115 problems", "2/24 stations", "2/24 rituals", "40 cards", "70% accuracy", "3 best streak"], blob: SEED_B });
  await s.expect("…and the cloud's was not touched either: no PUT, same row", async () => ({ put: B.net.count("PUT"), row: (await d1.get(H)).body }), { put: 0, row: held.body });
  await s.expect("…still marked as joining (cloud wins whenever it can be read), nothing acknowledged", async () => { const c = await B.cfg(); return { code: c.code, joining: c.joining, edited: c.editedAt, served: c.serverAt }; }, { code: H, joining: true, edited: 0, served: 0 });
  await B.shot("held", { bottom: true });
  await B.setDark(true);
  await B.shot("held", { bottom: true });
  await B.setDark(false);
  const gets = B.net.count("GET");
  await B.advance(65_000);
  await B.settle();
  await s.expect("a parked sync does not retry on a timer", () => B.net.count("GET"), gets);

  // ---- an edit while parked is not sent
  await edit(B, SEED_C);
  await B.advance(8_000);
  await B.settle();
  await s.expect("an edit while parked stays on this device: no PUT, the cloud row unchanged, the card still in error", async () => ({ put: B.net.count("PUT"), row: (await d1.get(H)).body.v, title: (await card(B.page)).title, saved: canonOf(await saved(B)).tracks.google.xp }), { put: 0, row: 3, title: "Update needed", saved: 710 });
  await B.clearToasts();
  await u.syncNow.click();
  await s.expect("Sync now tries the exchange, gets the same answer, and says the copy is from a newer app", async () => ({ toasts: await B.toasts(), get: B.net.count("GET") - gets, put: B.net.count("PUT") }), { toasts: ["The cloud copy is from a newer version of the app — reload to update"], get: 1, put: 0 });
  await B.reload();
  await B.tab("Me");
  await s.expect("after a reload it parks again and B still has its own progress, not the unreadable copy", async () => ({ title: (await card(B.page)).title, stats: (await stats(B.page))[0], xp: canonOf(await B.blob()).tracks.google.xp, put: B.net.count("PUT") }), { title: "Update needed", stats: "10/115 problems", xp: 710, put: 0 });

  // ---- Turn off clears it
  await B.clearToasts();
  await B.answering(true, () => u.turnOff.click());
  await s.expect("Turn off: sync is off and the panel is the plain one (no error card)", async () => ({ toasts: await B.toasts(), buttons: await panelButtons(B.page), card: await u.card.count(), cfg: await B.cfg() }), { toasts: ["Sync is off"], buttons: ["Turn on sync", "I have a code", "Link a device"], card: 0, cfg: null });
  await edit(B, SEED_B);
  await B.advance(8_000);
  await s.expect("…the parked state is gone with it: the cloud row is still the unreadable one, and nothing was sent", async () => ({ put: B.net.count("PUT"), row: (await d1.get(H)).body }), { put: 0, row: held.body });
  await u.turnOn.click();
  await s.expect("turning sync on afterwards starts clean under a new code and is not parked", async () => ({ title: (await card(B.page)).title, chip: await u.chip.textContent() }), { title: "All changes synced", chip: codeOf(10, "a", 1) });

  // ---- sending to it by link: the Worker refuses an older schema, whatever the stamp
  const C = await s.device({ seed: SEED_B, name: "c" });
  await C.open(`#sync=${H}&do=send`);
  await C.clearToasts();
  await C.page.getByRole("button", { name: "Send & link" }).click();
  await s.expect("a device that sends to it is refused (an older schema never replaces a newer one, however fresh): one PUT, the row unchanged", async () => ({ put: C.net.count("PUT", H), row: (await d1.get(H)).body }), { put: 1, row: held.body });
  await s.expect("…and the card closes saying nothing was sent, and why", async () => ({ cards: await C.page.locator(".linkcard").count(), toasts: await C.toasts() }), { cards: 0, toasts: ["Not sent: the cloud copy is from a newer version of the app — reload to update"] });
  await s.expect("…the panel shows the parked state, C's own progress intact", async () => ({ title: (await card(C.page)).title, stats: (await stats(C.page))[0], chip: await ui(C.page).chip.textContent() }), { title: "Update needed", stats: "8/115 problems", chip: H });

  // ---- Get mode's watch meets a row it cannot read: nothing was linked, so no Linked card
  const G = await s.device({ name: "g" });
  await G.openMe();
  await G.pause();
  await ui(G.page).link.click();
  const gcode = (await sheetState(G.page)).code;
  await d1.put(gcode, T0 + 5_000, FUTURE);
  await G.clearToasts();
  await G.pump(async () => (await G.page.locator(".qrscrim").count()) === 0);
  await s.expect("another device's row that this build cannot read arrives at an open Get sheet: the sheet closes without a Linked card", async () => G.page.locator(".qrscrim").count(), 0);
  await s.expect("…and the toast says the copy is from a newer app (not gold)", () => G.toasts(), ["The cloud copy is from a newer version of the app — reload to update"]);
  await s.expect("…the panel behind it shows the parked state", async () => (await card(G.page)).title, "Update needed");

  // ---- an older cloud copy (the original app's v1) is read and upgraded
  await d1.put(L, T0 + 1_000, LEGACY_V1);
  const D = await s.device({ name: "d" });
  await D.openMe();
  await ui(D.page).haveCode.click();
  await ui(D.page).codeInput.fill(L);
  await ui(D.page).connect.click();
  await s.expect("a v1 blob in the cloud is adopted like an import: it lands on the Google line", async () => ({ stats: await stats(D.page), title: (await card(D.page)).title }), { stats: ["5/115 problems", "1/24 stations", "2/24 rituals", "12 cards", "75% accuracy", "2 best streak"], title: "All changes synced" });
  await edit(D, SEED_B);
  await D.advance(4500);
  await s.expect("…and D's next edit replaces it as a v2 row (a newer schema may overwrite an older one)", async () => { const r = (await d1.get(L)).body; return { v: r.v, xp: r.data.tracks.google.xp }; }, { v: 2, xp: 480 });
  finish(s);
});

/* 11 ------------------------------------------------------------------ */
scenario("11-phone", "phone: the link sheet takes the whole screen, on a tall phone and a short one; the consent card", async (s) => {
  const geometry = (page) =>
    page.locator(SHEET).evaluate((scrim) => {
      const r = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.x * 10) / 10, Math.round(b.y * 10) / 10, Math.round(b.width * 10) / 10, Math.round(b.height * 10) / 10]; };
      const sheetEl = scrim.querySelector(".qrsheet");
      const close = [...sheetEl.querySelectorAll("button")].find((b) => b.textContent === "Close");
      return {
        scrim: r(scrim),
        scrimStyle: getComputedStyle(scrim).position,
        sheetWidth: r(sheetEl)[2],
        square: r(scrim.querySelector(".qrbig"))[2],
        toggle: r(scrim.querySelector(".segtoggle"))[3],
        scrolls: sheetEl.scrollHeight > sheetEl.clientHeight,
        closeVisible: close.getBoundingClientRect().bottom <= innerHeight,
        bodyLocked: getComputedStyle(document.body).overflow,
      };
    });

  // ---- a fresh phone, Get mode
  const A = await s.device({ phone: true });
  await A.openMe();
  await ui(A.page).link.tap();
  await A.pause();
  await s.expect("phone, Get mode: the scrim is the whole window and the card fills it less the 14px side padding", async () => { const g = await geometry(A.page); return { scrim: g.scrim, position: g.scrimStyle, width: g.sheetWidth, square: g.square, closeVisible: g.closeVisible, scrolls: g.scrolls }; }, { scrim: [0, 0, 390, 844], position: "fixed", width: 362, square: 304.2, closeVisible: true, scrolls: false });
  await s.expect("…the square is the link, the toggle is a 44px-tall control, and the Scan link is there", async () => ({ qr: (await qrCheck(A.page, linkOf(codeOf(11, "a", 1), "send"))).same, toggle: (await geometry(A.page)).toggle >= 50, sub: (await sheetState(A.page)).sub }), { qr: true, toggle: true, sub: ["Scan a code instead"] });
  await A.shot("sheet-get");
  await A.setDark(true);
  await A.shot("sheet-get");
  await A.setDark(false);
  await A.page.getByRole("button", { name: "Send progress" }).tap();
  await s.expect("phone, Send mode with sync off: the offer to turn it on, and the paste row", async () => { const st = await sheetState(A.page); return { enable: st.enable, paste: st.paste }; }, { enable: ["Turn on sync & show the code"], paste: "Or paste a code or link" });
  await A.shot("sheet-send-off");
  await A.page.getByRole("button", { name: "Close", exact: true }).tap();
  await s.expect("Close (tapped) closes it", () => sheet(A.page).count(), 0);

  // ---- a short phone, Get mode with the warning and the waiting line
  const S = await s.device({ phone: true, se: true, seed: SEED, name: "s" });
  await S.openMe();
  await ui(S.page).turnOn.tap();
  await s.expect("(sync on)", async () => (await card(S.page)).title, "All changes synced");
  await ui(S.page).link.tap();
  await S.page.getByRole("button", { name: "Get progress" }).tap();
  await S.pause();
  const g = await geometry(S.page);
  await s.expect("375x667 in Get mode with the warning and the waiting line: the card scrolls inside the window instead of squashing the toggle or the square", () => ({ scrim: g.scrim, scrolls: g.scrolls, toggle: g.toggle >= 50, square: g.square, width: g.sheetWidth }), { scrim: [0, 0, 375, 667], scrolls: true, toggle: true, square: 292.5, width: 347 });
  await S.page.locator(`${SHEET} .qrsheet`).evaluate((e) => e.scrollTo({ top: 0, behavior: "instant" }));
  await S.shot("sheet-get-top");
  await S.page.locator(`${SHEET} .qrsheet`).evaluate((e) => e.scrollTo({ top: e.scrollHeight, behavior: "instant" }));
  await s.expect("…scrolled to the end, Close is inside the window", async () => (await geometry(S.page)).closeVisible, true);
  await S.shot("sheet-get-bottom");

  // ---- the consent card on a phone
  const C = await s.device({ phone: true, seed: SEED_B, name: "c" });
  await C.open(`#sync=${codeOf(11, "x", 1)}&do=send`);
  await s.expect("phone: the consent card is in the page, inside the window, its buttons side by side", () => C.page.locator(".linkcard").evaluate((c) => { const r = c.getBoundingClientRect(); const bs = [...c.querySelectorAll("button")].map((b) => b.getBoundingClientRect()); return { inside: r.left >= 0 && r.right <= innerWidth, sameRow: new Set(bs.map((b) => Math.round(b.top))).size === 1, tall: bs.every((b) => b.height >= 30) }; }), { inside: true, sameRow: true, tall: true });
  await C.shot("consent", { bottom: true });
  await C.setDark(true);
  await C.shot("consent", { bottom: true });
  await C.setDark(false);
  await C.page.getByRole("button", { name: "Cancel" }).tap();
  await s.expect("phone: Cancel (tapped) dismisses it", () => C.page.locator(".linkcard").count(), 0);
  finish(s);
});

/* 12 ------------------------------------------------------------------ */
scenario("12-sync-errors", "an unreachable or broken cloud: the 30 s retry, the online event, 500s, junk answers, an edit during a push, offline joins and links", async (s) => {
  const OFFLINE = "Can't reach the cloud — progress is safe here";
  const ERROR_NOTE = "Progress is safe on this device and will sync when it can.";
  const tail = (D, from) => D.net.log.slice(from).map((e) => `${e.method} ${e.status}`);
  const errorCard = { title: "Cloud unreachable", when: null, tone: "var(--red)", glyph: "cloud-off" };
  const online = (D) => D.page.evaluate(() => window.dispatchEvent(new Event("online")));

  // ---- turning sync on with no network: queued, retried every 30 s, lands when the network is back
  const a1 = codeOf(12, "a", 1);
  const A = await s.device({ seed: SEED });
  await A.openMe();
  await A.pause();
  A.net.down = true;
  await A.clearToasts();
  await ui(A.page).turnOn.click();
  await A.settle();
  await s.expect("Turn on sync offline still turns it on (gold toast), but the card is the error look and has never synced", async () => ({ toasts: await A.toasts(), card: await card(A.page), note: await syncNote(A.page) }), { toasts: ["* Sync is on — enter this code on your other device"], card: errorCard, note: ERROR_NOTE });
  await s.expect("…the config holds the dirty stamp (edited ahead of acknowledged) for the retry and the next boot", async () => { const c = await A.cfg(); return { code: c.code, dirty: c.editedAt > c.serverAt, server: c.serverAt, ok: c.okAt }; }, { code: a1, dirty: true, server: 0, ok: 0 });
  await s.expect("…one push was tried and failed; the Worker has nothing", async () => ({ log: tail(A, 0), row: (await d1.get(a1)).status }), { log: ["PUT down"], row: 404 });
  await A.shot("offline-error", { bottom: true });
  await A.advance(29_000);
  await A.settle();
  await s.expect("29 s on: nothing new has been tried", () => tail(A, 0), ["PUT down"]);
  await A.advance(1_500);
  await A.settle();
  await s.expect("at 30 s the retry runs (a pull first), fails, and is armed again", () => tail(A, 0), ["PUT down", "GET down"]);
  await A.advance(30_000);
  await A.settle();
  await s.expect("…30 s later it tries again", async () => ({ log: tail(A, 0), title: (await card(A.page)).title }), { log: ["PUT down", "GET down", "GET down"], title: "Cloud unreachable" });
  A.net.down = false;
  await A.advance(30_000);
  await A.settle();
  await s.expect("with the network back the next retry finds nothing under the code, seeds it, and the card turns green", async () => ({ log: tail(A, 0).slice(3), title: (await card(A.page)).title, row: (await d1.get(a1)).body.data }), { log: ["GET 404", "PUT 200"], title: "All changes synced", row: SEED });
  await s.expect("…and the dirty stamp is acknowledged", async () => { const c = await A.cfg(); return c.serverAt === c.editedAt && c.okAt > 0; }, true);

  // ---- the network coming back is itself a trigger
  const b1 = codeOf(12, "b", 1);
  const B = await s.device({ seed: SEED });
  await B.openMe();
  await B.pause();
  B.net.down = true;
  await ui(B.page).turnOn.click();
  await B.settle();
  await s.expect("offline again: the error card", () => card(B.page), errorCard);
  B.net.down = false;
  await online(B);
  await B.settle();
  await s.expect("the window's 'online' event syncs at once, without waiting for the 30 s timer", async () => ({ log: tail(B, 0), title: (await card(B.page)).title, row: (await d1.get(b1)).body.data }), { log: ["PUT down", "GET 404", "PUT 200"], title: "All changes synced", row: SEED });

  // ---- the Worker erroring, or answering with something that is not JSON
  const c1 = codeOf(12, "c", 1);
  const C = await s.device({ seed: SEED });
  await C.openMe();
  await ui(C.page).turnOn.click();
  await s.expect("(C is synced)", async () => (await card(C.page)).title, "All changes synced");
  await edit(C, SEED_B);
  C.net.fail = 500;
  await C.advance(4_000);
  await C.settle();
  await s.expect("a 500 to the push is an error like any other: the card says unreachable, the Worker still has the old copy", async () => ({ card: (await card(C.page)).title, last: tail(C, 0).at(-1), row: (await d1.get(c1)).body.data.quiz.answered }), { card: "Cloud unreachable", last: "PUT 500", row: 134 });
  C.net.fail = null;
  C.net.garble = true;
  await C.clearToasts();
  await ui(C.page).syncNow.click();
  await C.settle();
  await s.expect("a 200 that is not JSON is an error too: Sync now says it cannot reach the cloud", async () => ({ toasts: await C.toasts(), last: tail(C, 0).at(-1), title: (await card(C.page)).title }), { toasts: [OFFLINE], last: "GET garbled", title: "Cloud unreachable" });
  C.net.garble = false;
  await C.clearToasts();
  await ui(C.page).syncNow.click();
  await C.settle();
  await s.expect("then Sync now, answered properly, pushes the edit that was waiting: gold 'Pushed to the cloud'", async () => ({ toasts: await C.toasts(), row: (await d1.get(c1)).body.data, title: (await card(C.page)).title }), { toasts: ["* Pushed to the cloud"], row: SEED_B, title: "All changes synced" });

  // ---- an edit made while a push is in the air gets its own round
  const d1c = codeOf(12, "d", 1);
  const D = await s.device({ seed: SEED });
  await D.openMe();
  await ui(D.page).turnOn.click();
  await s.expect("(D is synced)", async () => (await card(D.page)).title, "All changes synced");
  await edit(D, SEED_B);
  const release = D.net.hold();
  await D.advance(4_000);
  await s.expect("the first edit's push is out and unanswered: the card says Syncing…", async () => ({ inflight: D.net.inflight, title: (await card(D.page)).title, row: (await d1.get(d1c)).body.data.quiz.answered }), { inflight: 1, title: "Syncing…", row: 134 });
  await edit(D, SEED_C);
  release();
  await D.settle();
  await s.expect("when it lands the Worker has the first edit, and the second is still queued", async () => ({ row: (await d1.get(d1c)).body.data.quiz.answered, title: (await card(D.page)).title }), { row: 40, title: "Changes queued" });
  await D.advance(3_800);
  await D.settle();
  await s.expect("the second edit waits its own 4 s", async () => ({ row: (await d1.get(d1c)).body.data.quiz.answered, puts: D.net.count("PUT") }), { row: 40, puts: 2 });
  await D.advance(400);
  await D.settle();
  await s.expect("…and then goes out: three PUTs in all, the Worker has the last edit, the card is green", async () => ({ puts: D.net.count("PUT"), row: (await d1.get(d1c)).body.data.quiz.answered, title: (await card(D.page)).title }), { puts: 3, row: 55, title: "All changes synced" });

  // ---- joining by typing the code with the network down: the cloud wins when it can
  const j = codeOf(12, "j", 1);
  await d1.put(j, T0 + 2_000, SEED);
  const E = await s.device({ seed: SEED_B });
  await E.openMe();
  await E.pause();
  E.net.down = true;
  await ui(E.page).haveCode.click();
  await ui(E.page).codeInput.fill(j);
  await E.clearToasts();
  await E.answering(true, () => ui(E.page).connect.click());
  await E.settle();
  await s.expect("joining offline: 'Connected — cloud unreachable right now, will keep trying' (not gold), the error card, own progress kept", async () => ({ toasts: await E.toasts(), card: (await card(E.page)).title, stats: (await stats(E.page))[0] }), { toasts: ["Connected — cloud unreachable right now, will keep trying"], card: "Cloud unreachable", stats: "8/115 problems" });
  await s.expect("…the config remembers it is joining, so the cloud copy wins whenever it is reached", async () => { const c = await E.cfg(); return { code: c.code, joining: c.joining, edited: c.editedAt }; }, { code: j, joining: true, edited: 0 });
  E.net.down = false;
  await E.clearToasts();
  await E.advance(30_000);
  await E.settle();
  await s.expect("30 s later the retry adopts the cloud copy (gold toast), drops the joining flag and pushes nothing", async () => ({ toasts: await E.toasts(), stats: (await stats(E.page))[0], cfg: await E.cfg(), put: E.net.count("PUT") }), (v) => v.toasts.join() === "* Progress synced from the cloud" && v.stats === "22/115 problems" && v.cfg.code === j && !("joining" in v.cfg) && v.put === 0);

  // ---- accepting a link with the network down
  const q = codeOf(12, "q", 1);
  const F = await s.device({ seed: SEED_B });
  await F.pause();
  F.net.down = true;
  await F.open(`#sync=${q}&do=send`);
  await F.clearToasts();
  await F.page.getByRole("button", { name: "Send & link" }).click();
  await F.settle();
  await s.expect("a 'send' link accepted offline: 'Will send when the cloud is reachable'; the card closes and the error card shows", async () => ({ toasts: await F.toasts(), cards: await F.page.locator(".linkcard").count(), card: (await card(F.page)).title }), { toasts: ["Will send when the cloud is reachable"], cards: 0, card: "Cloud unreachable" });
  F.net.down = false;
  await F.advance(30_000);
  await F.settle();
  await s.expect("…and it is sent by the retry", async () => ({ row: (await d1.get(q)).body.data, title: (await card(F.page)).title }), { row: SEED_B, title: "All changes synced" });
  const r = codeOf(12, "r", 1);
  await d1.put(r, T0 + 3_000, SEED);
  const G = await s.device({ seed: SEED_B });
  await G.pause();
  G.net.down = true;
  await G.open(`#sync=${r}&do=recv`);
  await G.clearToasts();
  await G.page.getByRole("button", { name: "Connect & adopt" }).click();
  await G.settle();
  await s.expect("a 'receive' link accepted offline: 'Connected — cloud unreachable right now, will keep trying'; the card closes, own progress kept", async () => ({ toasts: await G.toasts(), cards: await G.page.locator(".linkcard").count(), stats: (await stats(G.page))[0] }), { toasts: ["Connected — cloud unreachable right now, will keep trying"], cards: 0, stats: "8/115 problems" });
  G.net.down = false;
  await G.advance(30_000);
  await G.settle();
  await s.expect("…and the retry adopts the cloud copy", async () => ({ stats: (await stats(G.page))[0], title: (await card(G.page)).title }), { stats: "22/115 problems", title: "All changes synced" });

  // ---- Get mode's watch when the cloud cannot be reached
  const H = await s.device({});
  await H.openMe();
  await H.pause();
  H.net.down = true;
  await ui(H.page).link.click();
  await H.settle();
  await s.expect("the sheet's waiting line says the cloud is unreachable while it keeps watching", async () => (await sheetState(H.page)).wait, "Cloud unreachable — progress here is safe; still watching for the other device.");
  await H.shot("get-unreachable");
  H.net.down = false;
  await H.advance(2_500);
  await H.settle();
  await s.expect("when a peek is answered again it goes back to waiting", async () => (await sheetState(H.page)).wait, "Waiting for the other device...");
  finish(s);
});

/* 13 ------------------------------------------------------------------ */
scenario("13-motion", "with motion allowed: confetti only where two devices actually linked; the settle pop; none at all under reduced motion", async (s) => {
  const pop = (D) => D.page.locator(".synccard").evaluate((c) => c.classList.contains("pop"));
  const burst = [12];
  const a = codeOf(13, "a", 1);

  // ---- turning sync on celebrates nothing, but the card pops once when the push lands
  const A = await s.device({ seed: SEED, motion: true });
  await A.openMe();
  await A.pause();
  await ui(A.page).turnOn.click();
  await A.settle();
  await s.expect("Turn on sync: no confetti; the card, settled, wears its 'pop' for 800 ms", async () => ({ confetti: await A.confettiLog(), pop: await pop(A), title: (await card(A.page)).title }), { confetti: [], pop: true, title: "All changes synced" });
  await A.advance(800);
  await s.expect("…and drops it", () => pop(A), false);
  await A.reload();
  await A.tab("Me");
  await s.expect("a card that is already settled when the page loads does not pop (mount is not a transition)", () => pop(A), false);

  // ---- typing a code: 12 pieces
  const B = await s.device({ motion: true });
  await B.openMe();
  await ui(B.page).haveCode.click();
  await ui(B.page).codeInput.fill(a);
  await ui(B.page).connect.click();
  await s.expect("joining by typing the code throws one burst of 12", async () => ({ confetti: await B.confettiLog(), title: (await card(B.page)).title }), { confetti: burst, title: "All changes synced" });
  await B.advance(3_000);
  await s.expect("…and it clears itself from the page after its 2.8 s", () => B.page.locator(".confetti").count(), 0);

  // ---- accepting a consent card where something linked: adopt, and send
  const C = await s.device({ seed: SEED_B, motion: true });
  await C.open(`#sync=${a}&do=recv`);
  await C.page.getByRole("button", { name: "Connect & adopt" }).click();
  await s.expect("accepting an adopt card: one burst of 12", () => C.confettiLog(), burst);
  const fresh = codeOf(13, "n", 1);
  const D = await s.device({ seed: SEED_B, motion: true });
  await D.open(`#sync=${fresh}&do=send`);
  await D.page.getByRole("button", { name: "Send & link" }).click();
  await s.expect("accepting a send card that pushed: one burst of 12", async () => ({ confetti: await D.confettiLog(), toasts: await D.toasts() }), { confetti: burst, toasts: ["* Progress sent — devices linked"] });

  // ---- where nothing linked, nothing falls
  await A.page.evaluate((c) => (location.hash = `#sync=${c}&do=send`), a);
  await A.clearToasts();
  await A.page.getByRole("button", { name: "Send & link" }).click();
  await s.expect("re-scanning its own code ('Already in sync'): no confetti", async () => ({ confetti: await A.confettiLog(), toasts: await A.toasts() }), { confetti: [], toasts: ["Already in sync"] });
  const offline = codeOf(13, "o", 1);
  await d1.put(offline, T0 + 1_000, SEED);
  const E = await s.device({ seed: SEED_B, motion: true });
  E.net.down = true;
  await E.open(`#sync=${offline}&do=recv`);
  await E.page.getByRole("button", { name: "Connect & adopt" }).click();
  await E.settle();
  await s.expect("a link accepted with the cloud unreachable linked nothing: no confetti", () => E.confettiLog(), []);
  const typed = await s.device({ seed: SEED_B, motion: true });
  typed.net.down = true;
  await typed.openMe();
  await ui(typed.page).haveCode.click();
  await ui(typed.page).codeInput.fill(offline);
  await typed.answering(true, () => ui(typed.page).connect.click());
  await typed.settle();
  await s.expect("…nor does typing a code that cannot be reached", () => typed.confettiLog(), []);

  const heldCode = codeOf(13, "k", 1);
  await d1.put(heldCode, T0 - 3_600_000, FUTURE);
  const K = await s.device({ seed: SEED_B, motion: true });
  await K.open(`#sync=${heldCode}&do=send`);
  await K.page.getByRole("button", { name: "Send & link" }).click();
  await K.settle();
  await s.expect("a send link to a copy this build cannot read is refused by the Worker: no confetti, and the toast says nothing was sent", async () => ({ confetti: await K.confettiLog(), toasts: await K.toasts(), row: (await d1.get(heldCode)).body.v }), { confetti: [], toasts: ["Not sent: the cloud copy is from a newer version of the app — reload to update"], row: 3 });

  // ---- the sheet's arrival
  const F = await s.device({ motion: true });
  await F.openMe();
  await F.pause();
  await ui(F.page).link.click();
  const G = await s.device({ seed: SEED_B, motion: true });
  await G.open(`#sync=${(await sheetState(F.page)).code}&do=send`);
  await G.page.getByRole("button", { name: "Send & link" }).click();
  await F.pump(async () => (await sheetState(F.page).catch(() => ({}))).linked === "Linked");
  await s.expect("the other device arriving at an open Get sheet: one burst of 12 (and the Linked card)", async () => ({ confetti: await F.confettiLog(), linked: (await sheetState(F.page)).linked }), { confetti: burst, linked: "Linked" });

  // ---- reduced motion: none at all
  const H = await s.device({});
  await H.openMe();
  await ui(H.page).haveCode.click();
  await ui(H.page).codeInput.fill(a);
  await ui(H.page).connect.click();
  await s.expect("with reduced motion the same join throws nothing, and the page has no confetti layer", async () => ({ confetti: await H.confettiLog(), layer: await H.page.locator(".confetti").count(), title: (await card(H.page)).title }), { confetti: [], layer: 0, title: "All changes synced" });
  finish(s);
});

/* 14 ------------------------------------------------------------------ */
scenario("14-boot", "sync across a reload: pending edits pushed at boot, a newer cloud copy adopted at boot, bad configs ignored, no adoption mid-quiz", async (s) => {
  const nav = (page, name) => page.getByRole("navigation", { name: "Sections" }).getByRole("button", { name, exact: true });
  const cfgOf = (code, o = {}) => ({ code, editedAt: 0, serverAt: 0, okAt: 0, ...o });

  // ---- a session that ended with edits not yet acknowledged pushes them on the next boot
  const p = codeOf(14, "p", 1);
  await d1.put(p, T0 + 1_000, SEED);
  const A = await s.device({ seed: SEED_B, syncCfg: cfgOf(p, { editedAt: T0 + 5_000, serverAt: T0 + 1_000, okAt: T0 + 1_000 }) });
  const release = A.net.hold();
  await A.open();
  await A.tab("Me");
  await s.expect("a boot with edits waiting: the card is up straight away, working on the exchange", () => card(A.page).then((c) => c.title), "Syncing…");
  release();
  await s.expect("it pulls (the row is the device's own old write), then pushes the waiting edit under its stamp", async () => ({ log: A.net.log.map((e) => `${e.method} ${e.status}`), row: (await d1.get(p)).body }), (v) => JSON.stringify(v.log) === JSON.stringify(["GET 200", "PUT 200"]) && v.row.updatedAt === T0 + 5_000 && JSON.stringify(canonOf(v.row.data)) === JSON.stringify(canonOf(SEED_B)));
  await s.expect("…and ends green with the stamp acknowledged, no toast", async () => ({ title: (await card(A.page)).title, cfg: await A.cfg(), toasts: await A.toasts() }), (v) => v.title === "All changes synced" && v.cfg.serverAt === T0 + 5_000 && v.cfg.editedAt === T0 + 5_000 && v.toasts.length === 0);

  // ---- the cloud moved on while the device was closed
  const q = codeOf(14, "q", 1);
  await d1.put(q, T0 + 9_000, SEED_C);
  const B = await s.device({ seed: SEED_B, syncCfg: cfgOf(q, { editedAt: T0 + 1_000, serverAt: T0 + 1_000, okAt: T0 + 1_000 }) });
  await B.open();
  await B.tab("Me");
  await s.expect("a newer cloud copy is adopted at boot: gold toast, the new numbers, stamps equal to the row's, nothing pushed", async () => ({ toasts: await B.toasts(), stats: (await stats(B.page))[0], cfg: await B.cfg(), put: B.net.count("PUT") }), (v) => v.toasts.join() === "* Progress synced from the cloud" && v.stats === "10/115 problems" && v.cfg.editedAt === T0 + 9_000 && v.cfg.serverAt === T0 + 9_000 && v.put === 0);

  // ---- a join that never finished: the cloud wins even over a newer local edit
  const r = codeOf(14, "r", 1);
  await d1.put(r, T0 + 1_000, SEED);
  const C = await s.device({ seed: SEED_B, syncCfg: cfgOf(r, { editedAt: T0 + 9_000_000_000, joining: true }) });
  await C.open();
  await C.tab("Me");
  await s.expect("a config still marked 'joining' lets the cloud copy win at boot even against a much newer local stamp", async () => ({ stats: (await stats(C.page))[0], cfg: await C.cfg(), put: C.net.count("PUT") }), (v) => v.stats === "22/115 problems" && !("joining" in v.cfg) && v.cfg.editedAt === T0 + 1_000 && v.put === 0);

  // ---- a config whose code never reached the cloud seeds it
  const t = codeOf(14, "t", 1);
  const D = await s.device({ seed: SEED_B, syncCfg: cfgOf(t) });
  await D.open();
  await D.tab("Me");
  await s.expect("a config with nothing acknowledged and nothing under its code: the device seeds the cloud", async () => ({ log: D.net.log.map((e) => `${e.method} ${e.status}`), row: canonOf((await d1.get(t)).body.data), title: (await card(D.page)).title }), { log: ["GET 404", "PUT 200"], row: canonOf(SEED_B), title: "All changes synced" });

  // ---- configs it cannot use
  for (const [what, raw] of [["is not JSON", "{not json"], ["has a code too short", JSON.stringify({ code: "short", editedAt: 1, serverAt: 1, okAt: 1 })], ["is a list", "[]"], ["is a string", '"hello"']]) {
    const E = await s.device({ seed: SEED_B, syncCfg: raw });
    await E.open();
    await E.tab("Me");
    await s.expect(`a saved sync config that ${what} is ignored: sync is off, nothing is asked of the Worker`, async () => ({ buttons: await panelButtons(E.page), requests: E.net.count() }), { buttons: ["Turn on sync", "I have a code", "Link a device"], requests: 0 });
  }

  // ---- an ordinary reload
  const u = codeOf(14, "u", 1);
  const F = await s.device({ seed: SEED, name: "u" });
  await F.openMe();
  await ui(F.page).turnOn.click();
  await edit(F, SEED_B);
  await F.advance(4_100);
  await F.settle();
  await F.resume();
  await saved(F);
  await F.reload();
  await F.tab("Me");
  await s.expect("after a reload: the same code, the edit kept, level with the Worker", async () => ({ chip: await ui(F.page).chip.textContent(), stats: (await stats(F.page))[0], title: (await card(F.page)).title, row: canonOf((await d1.get(u)).body.data) }), { chip: u, stats: "8/115 problems", title: "All changes synced", row: canonOf(SEED_B) });

  // ---- a consumed link is not offered twice
  const w = codeOf(14, "w", 1);
  const G = await s.device({ seed: SEED_B });
  await G.open(`#sync=${w}&do=send`);
  await s.expect("the link is offered once...", () => G.page.locator(".linkcard").count(), 1);
  await G.reload();
  await s.expect("...and a reload (the address is bare now) does not offer it again", async () => ({ cards: await G.page.locator(".linkcard").count(), hash: await G.page.evaluate(() => location.hash) }), { cards: 0, hash: "" });

  // ---- never mid-run: a run is not pulled out from under the reader by the tab coming back
  const H = await s.device({ seed: SEED, name: "h" });
  await H.openMe();
  await ui(H.page).turnOn.click();
  const I = await s.device({ name: "i" });
  await I.openMe();
  await ui(I.page).haveCode.click();
  await ui(I.page).codeInput.fill(codeOf(14, "h", 1));
  await ui(I.page).connect.click();
  await s.expect("(I has joined H's code)", async () => ({ title: (await card(I.page)).title, stats: (await stats(I.page))[0] }), { title: "All changes synced", stats: "22/115 problems" });
  await edit(H, SEED_C);
  await H.hidden(true);
  await H.settle();
  await H.hidden(false);
  await I.tab("Metro");
  await I.page.locator("button.board").click();
  await s.expect("I starts a run on the Metro tab", async () => ({ card: await I.page.locator("#quizArea .qwrap").count(), counter: (await I.page.locator(".qmeta span").first().textContent()) }), { card: 1, counter: "1/10" });
  await I.pause();
  await I.advance(31_000);
  const gets = I.net.count("GET");
  await I.hidden(true);
  await I.hidden(false);
  await I.settle();
  await s.expect("the tab coming back mid-run does not look at the cloud", () => I.net.count("GET"), gets);
  await I.tab("Me");
  await ui(I.page).syncNow.click();
  await I.settle();
  await s.expect("but an explicit Sync now does, and adopting ends the run (the new copy replaces the world)", async () => ({ stats: (await stats(I.page))[0], toasts: await I.toasts() }), (v) => v.stats === "10/115 problems" && v.toasts.at(-1) === "* Progress synced from the cloud");
  await I.tab("Metro");
  await s.expect("…back on the Metro tab there is no run any more: the deck picker", async () => ({ run: await I.page.locator("#quizArea .qwrap").count(), picker: await I.page.locator("button.board").count() }), { run: 0, picker: 1 });
  await edit(H, SEED_B);
  await H.hidden(true);
  await H.settle();
  await H.hidden(false);
  await I.advance(31_000);
  const gets2 = I.net.count("GET");
  await I.hidden(true);
  await I.hidden(false);
  await I.settle();
  await s.expect("out of a run, coming back to the tab does pull: H's newer edit is adopted", async () => ({ get: I.net.count("GET") - gets2, stats: (await I.page.evaluate(() => document.querySelector("header.hdr .hdr-stats span:last-child b").textContent)) }), { get: 1, stats: "480" });
  finish(s);
});

scenario("15-disconnect-midflight", "turning sync off while a sync is in flight leaves nothing stuck", async (s) => {
  const A = await s.device({ seed: SEED_B });
  await A.openMe();
  const u = ui(A.page);
  await u.turnOn.click();
  await A.settle();
  await s.expect("(setup) sync is on and settled", async () => (await card(A.page)).title, "All changes synced");
  const release = A.net.hold();
  await u.syncNow.click();
  await s.expect("(setup) Sync now's pull is in flight", () => A.net.inflight, 1);
  await A.answering(true, () => u.turnOff.click());
  await s.expect("Turn off while it is in flight: sync is off at once", async () => ({ card: await u.card.count(), cfg: await A.cfg() }), { card: 0, cfg: null });
  release();
  await A.settle();
  await u.turnOn.click();
  await A.settle();
  await s.expect("turning sync on again pushes under the new code and settles, instead of hanging on Syncing…", async () => ({ title: (await card(A.page)).title, put: A.net.count("PUT", codeOf(15, "a", 2)), row: (await d1.get(codeOf(15, "a", 2))).status }), { title: "All changes synced", put: 1, row: 200 });
  finish(s);
});

/* ------------------------------ driver ------------------------------ */

let browser;
runSuite({
  out: OUT,
  scenarios,
  makeScenario: (sc) => new MeScenario(sc.id, sc.title),
  setup: async () => {
    browser = await chromium.launch(launchOptions());
    configure({ base: BASE, out: OUT, browser });
  },
  teardown: () => browser.close(),
})
  .then((status) => process.exit(status))
  .catch((e) => {
    console.error("me-regress crashed:", e);
    process.exit(2);
  });
