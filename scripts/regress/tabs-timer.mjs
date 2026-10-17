// The mock clock on the Line's mock days (06): its labels and glyphs, the count, the red under five minutes, pencils
// down at zero (the gold toast and 40 pieces of confetti, once), and that it keeps running when the day is
// collapsed or another tab is showing. Playwright's clock moves the time; nothing waits for real.

import { finish } from "./me-lib.mjs";
import { F, feedOf, scrollToStn } from "./tabs-kit.mjs";
import { stn, dayHead, RGB } from "./tabs-line.mjs";

const clock = (page, pos = 6) =>
  stn(page, pos).locator(".timer").evaluate((t) => ({
    cls: t.className,
    text: t.querySelector("b").textContent,
    role: t.querySelector("b").getAttribute("role"),
    live: t.querySelector("b").getAttribute("aria-live"),
    btns: [...t.querySelectorAll(".tbtn")].map((b) => b.textContent.trim() + ":" + window.__glyph(b.querySelector("svg"))),
    note: t.querySelector(".xpv").textContent,
  }));

const everyClock = (page) => page.locator(".timer b").allTextContents();

export default function register(scenario) {
  scenario("06-mock-timer", "the mock clock: start, pause, resume, reset, red under five minutes, pencils down at zero, running across tabs and collapsed cards", async (s) => {
    const A = await s.device({ seed: F.mock, motion: true });
    await A.open();
    await A.pause();
    const page = A.page;
    const btn = (name) => stn(page, 6).locator(".timer").getByRole("button", { name, exact: true });
    const idle = { cls: "timer", text: "25:00", role: "timer", live: "off", btns: ["Start:play", "Reset:rotate-ccw"], note: "the mock clock" };

    // ---- at rest
    await s.expect("day 7 (the focus day, open) carries the clock: 25:00, a timer role that stays quiet for screen readers, Start and Reset, 'the mock clock'", () => clock(page), idle);
    await s.expect("four clocks are mounted (days 7, 18, 22, 24) and they all show the one time", async () => (await everyClock(page)), ["25:00", "25:00", "25:00", "25:00"]);
    await s.expect("the readout is 22px mono with tabular figures, in ink; the row is a sunken pill", async () => ({
      b: await A.props(stn(page, 6).locator(".timer b"), ["font-size", "color", "font-variant-numeric", "letter-spacing"]),
      row: await A.props(stn(page, 6).locator(".timer"), ["display", "border-top-left-radius", "padding-top", "padding-left", "gap", "margin-top"]),
    }), { b: { "font-size": "22px", color: RGB.ink, "font-variant-numeric": "tabular-nums", "letter-spacing": "0.44px" }, row: { display: "flex", "border-top-left-radius": "10px", "padding-top": "10px", "padding-left": "12px", gap: "10px", "margin-top": "10px" } });
    await s.expect("its buttons are small pills: 12.5px semibold, 12px glyphs", async () => ({ btn: await A.props(btn("Start"), ["font-size", "font-weight", "border-top-left-radius", "padding-left", "display"]), glyph: await btn("Start").locator("svg").evaluate((e) => e.getAttribute("width")) }), { btn: { "font-size": "12.5px", "font-weight": "600", "border-top-left-radius": "999px", "padding-left": "12px", display: "flex" }, glyph: "12" });
    await scrollToStn(A, 6);
    await A.shot("timer-start");

    // ---- start, pause, resume
    await btn("Start").click();
    await s.expect("Start: the button becomes Pause with a pause glyph; nothing has ticked yet", () => clock(page), { ...idle, btns: ["Pause:pause", "Reset:rotate-ccw"] });
    await s.marked(A, "the clock, running (day 7)", ".linewrap > .stn:nth-child(7) .timer");
    await A.advance(1000);
    await s.expect("one second on: 24:59", async () => (await clock(page)).text, "24:59");
    await A.advance(4000);
    await s.expect("five seconds on: 24:55, on every clock", () => everyClock(page), ["24:55", "24:55", "24:55", "24:55"]);
    await btn("Pause").click();
    await s.expect("Pause: the button says Resume with a play glyph", async () => (await clock(page)).btns, ["Resume:play", "Reset:rotate-ccw"]);
    await A.advance(5000);
    await s.expect("paused: five more seconds change nothing", async () => (await clock(page)).text, "24:55");
    await btn("Resume").click();
    await A.advance(5000);
    await s.expect("Resume carries on from 24:55: five seconds later 24:50, Pause again", async () => { const c = await clock(page); return [c.text, c.btns[0]]; }, ["24:50", "Pause:pause"]);

    // ---- another tab, a collapsed card
    await A.tab("Metro");
    await A.advance(10_000);
    await A.tab("Line");
    await s.expect("it keeps running while another tab is showing: ten seconds in Metro, back to 24:40 and still counting", async () => { const c = await clock(page); return [c.text, c.btns[0]]; }, ["24:40", "Pause:pause"]);
    await dayHead(page, 6).click();
    await A.advance(5000);
    await dayHead(page, 6).click();
    await s.expect("…and while its day is collapsed: five seconds closed, 24:35", async () => (await clock(page)).text, "24:35");

    // ---- under five minutes
    await A.advance(1_174_000);
    await s.expect("at 05:01 the readout is still ink", async () => ({ ...(await clock(page)), color: (await A.props(stn(page, 6).locator(".timer b"), ["color"])).color }), { ...idle, text: "05:01", btns: ["Pause:pause", "Reset:rotate-ccw"], color: RGB.ink });
    await A.advance(1000);
    await s.expect("at 05:00 the clock goes red: class 'low' and the readout in the red", async () => ({ ...(await clock(page)), color: (await A.props(stn(page, 6).locator(".timer b"), ["color"])).color }), { ...idle, cls: "timer low", text: "05:00", btns: ["Pause:pause", "Reset:rotate-ccw"], color: RGB.red });
    await A.pause();
    await scrollToStn(A, 6);
    await A.shot("timer-low");
    await A.setDark(true);
    await s.expect("in the dark palette the low readout is the softer red", async () => (await A.props(stn(page, 6).locator(".timer b"), ["color"])).color, "rgb(242, 139, 130)");
    await A.shot("timer-low");
    await A.setDark(false);
    await btn("Pause").click();
    await s.expect("paused under five minutes it stays red, with Resume", async () => { const c = await clock(page); return [c.cls, c.btns[0]]; }, ["timer low", "Resume:play"]);
    await btn("Resume").click();

    // ---- pencils down
    await A.advance(299_000);
    await s.expect("a second before zero: 00:01, still running and red", async () => { const c = await clock(page); return [c.text, c.cls, c.btns[0]]; }, ["00:01", "timer low", "Pause:pause"]);
    await A.clearFx();
    await A.advance(1000);
    await s.expect("zero: pencils down — a gold toast and a burst of 40, once", async () => feedOf(await A.fx()), ["* ⏰ Pencils down.", "confetti 40"]);
    await s.expect("…the clock stops at 00:00, reads Done with a check glyph, and stays red", async () => { const c = await clock(page); return [c.text, c.cls, c.btns[0]]; }, ["00:00", "timer low", "Done:check"]);
    await s.expect("…on the page: the toast and the 40 pieces", () => A.live(), { toasts: ["* ⏰ Pencils down."], bursts: [40] });
    const first = await A.fx();
    await A.advance(10_000);
    await s.expect("ten more seconds: no second toast, the clock still reads 00:00", async () => ({ fx: (await A.fx()).length, text: (await clock(page)).text }), { fx: 2, text: "00:00" });
    await s.marked(A, "the clock, done (day 7)", ".linewrap > .stn:nth-child(7) .timer");
    await scrollToStn(A, 6);
    await A.shot("timer-done");
    await btn("Done").click();
    await A.advance(3000);
    await s.expect("pressing Done does not restart it", async () => { const c = await clock(page); return [c.text, c.btns[0], (await A.fx()).length]; }, ["00:00", "Done:check", 2]);

    // ---- reset
    await btn("Reset").click();
    await s.expect("Reset: back to 25:00, Start, no longer red, on every clock; no celebration", async () => ({ clock: await clock(page), all: await everyClock(page), fx: (await A.fx()).length }), { clock: idle, all: ["25:00", "25:00", "25:00", "25:00"], fx: 2 });
    await btn("Start").click();
    await A.advance(3000);
    await btn("Reset").click();
    await A.advance(5000);
    await s.expect("Reset while running stops it: 25:00 and Start, and five more seconds change nothing", () => clock(page), idle);

    // ---- zero while another tab is showing
    await btn("Start").click();
    await A.tab("Dojo");
    await A.clearFx();
    await A.advance(1_500_000);
    await s.expect("run to zero while the Dojo is showing: the toast and the burst of 40 arrive there, with higher ids than the first time", async () => {
      const fx = await A.fx();
      return { feed: feedOf(fx), later: Math.min(...fx.map((e) => Number(e.key))) > Math.max(...first.map((e) => Number(e.key))) };
    }, { feed: ["* ⏰ Pencils down.", "confetti 40"], later: true });
    await s.expect("…and the toast is on the Dojo's page", () => A.live(), { toasts: ["* ⏰ Pencils down."], bursts: [40] });
    await A.tab("Line");
    await s.expect("back on the Line: 00:00 and Done", async () => { const c = await clock(page); return [c.text, c.btns[0]]; }, ["00:00", "Done:check"]);
    finish(s);
  });
}
