// The app shell: the header (rank, XP bar, streak), the tab bar, what a tab press does, the line that tints the
// app (data-track), and the first rungs of the stacking order.

import { finish } from "./me-lib.mjs";
import { F, SECTIONS, H1, GLYPH_OF_TAB, hdr, hdrModel, tabBar, view, noHScroll, rankModel } from "./tabs-kit.mjs";

const ACCENT = { google: { light: "rgb(26, 115, 232)", dark: "rgb(138, 180, 248)" }, aws: { light: "rgb(217, 105, 11)", dark: "rgb(255, 153, 0)" } };

const tabsExpected = (current) => ({
  label: "Sections",
  tabs: SECTIONS.map((t) => ({ text: t, cls: t === current ? "tab on" : "tab", current: t === current ? "page" : null, glyph: GLYPH_OF_TAB[t], size: "20" })),
});

export default function register(scenario) {
  scenario("01-shell", "the shell: header, tab bar, navigation, scroll reset, stacking, per-line accent", async (s) => {
    const A = await s.device({ seed: F.mid, motion: true });
    await A.open();
    const page = A.page;
    const tabBtn = (label) => page.locator("nav.tabs").getByRole("button", { name: label, exact: true });
    const MID = { rank: "Pathfinder", dot: "var(--red)", streak: "Streak 2/2", xp: "200", fill: "67%", where: "Day 3 | Constraint St.", next: "50 XP to Backtracker" };

    // ---- the tab bar
    await s.expect("the page is titled", () => page.title(), "YALC — Yet Another LeetCode Clone");
    await s.expect("the tab bar is the nav named Sections: Line, Metro, Dojo, Me with a route, train, code and chart glyph at 20px; Line is current", () => tabBar(page), tabsExpected("Line"));
    await s.expect("one view is mounted (the Line's), headed Onsite Express", () => view(page), { views: 1, h1: H1.Line, on: "view on" });
    await s.expect("the header, from the seeded progress: Pathfinder, a red dot, 200 XP, streak 2, the bar 67% of the way to Backtracker, Day 3 Constraint St.", () => hdr(page), MID);
    await s.expect("…which is what the saved blob says (the header model)", () => hdr(page), hdrModel(F.mid));
    await s.expect("the Line has not been told it is the Local: data-track on <html> is google", () => page.evaluate(() => document.documentElement.dataset.track), "google");
    await s.expect("the streak is announced as 'Streak 2' and the XP reads 'XP 200'", () => page.locator("header.hdr .hdr-stats").evaluate((e) => ({ aria: e.children[0].getAttribute("aria-label"), xp: e.children[1].textContent, flame: window.__glyph(e.querySelector("svg")) })), { aria: "Streak 2", xp: "XP 200", flame: "flame" });
    await s.expect("the sub-line is the station on the left (with a dot between Day and name) and the next rank on the right", () => page.locator("header.hdr .xp-sub").evaluate((e) => ({ kids: [...e.children].map((c) => c.tagName + (c.className ? "." + c.className : "")), dotHidden: e.querySelector(".xp-dot").getAttribute("aria-hidden") })), { kids: ["SPAN.xp-day", "SPAN"], dotHidden: "true" });
    await s.expect("the XP bar is a 4px track with a gradient fill through the four logo colours", () => A.props(".xp-track", ["height"]).then(async (t) => ({ track: t.height, fill: (await A.props(".xp-fill", ["background-image"]))["background-image"] })), (v) => v.track === "4px" && ["rgb(26, 115, 232)", "rgb(217, 48, 37)", "rgb(249, 171, 0)", "rgb(30, 142, 62)"].every((c) => v.fill.includes(c)));

    // ---- stacking and position of the two bars
    const hp = await A.props("header.hdr", ["position", "z-index", "top"]);
    const tp = await A.props("nav.tabs", ["position", "z-index", "bottom", "display"]);
    await s.expect("the header is sticky at the top at level 30; the tab bar is fixed to the bottom at level 40", async () => ({ hdr: hp, tabs: tp }), { hdr: { position: "sticky", "z-index": "30", top: "0px" }, tabs: { position: "fixed", "z-index": "40", bottom: "0px", display: "flex" } });
    await s.pin("the tab bar's blur and tint", await A.props("nav.tabs", ["backdrop-filter", "background-color", "border-top-width", "padding-top", "padding-bottom"]));
    await A.scrollTo(900);
    await s.expect("scrolled 900px down the line the header still sits at the top edge and the tab bar at the bottom edge", async () => ({ hdr: (await A.rect("header.hdr")).y, tabs: (await A.rect("nav.tabs")).y + (await A.rect("nav.tabs")).h, scrolled: (await A.scrollY()) > 800 }), { hdr: 0, tabs: 860, scrolled: true });
    await s.expect("the four tabs share the width equally", async () => (await page.locator("nav.tabs .tab").evaluateAll((els) => [...new Set(els.map((e) => Math.round(e.getBoundingClientRect().width * 10) / 10))])).length, 1);

    // ---- a tab press: the view, the current tab, the scroll
    for (const label of ["Dojo", "Me", "Metro", "Line"]) {
      await A.scrollTo(400);
      await A.tab(label);
      await s.expect(`pressing ${label}: it becomes current, the view is ${label}'s, the header is as it was`, async () => ({ bar: await tabBar(page), view: await view(page), hdr: await hdr(page) }), { bar: tabsExpected(label), view: { views: 1, h1: H1[label], on: "view on" }, hdr: MID });
    }
    await A.tab("Line");
    await A.scrollTo(700);
    await s.expect("the Line is 700px down...", () => A.scrollY(), 700);
    await A.tab("Dojo");
    await s.expect("...Dojo: back at the top", () => A.scrollY(), 0);
    await A.scrollTo(300);
    await A.tab("Me");
    await s.expect("...Me: back at the top", () => A.scrollY(), 0);
    await A.scrollTo(300);
    await A.tab("Line");
    await s.expect("...Line: back at the top", () => A.scrollY(), 0);
    await A.scrollTo(500);
    await A.tab("Line");
    await s.expect("pressing the tab you are on scrolls to the top too", () => A.scrollY(), 0);

    // ---- the pointer
    await tabBtn("Metro").hover();
    const ink = (await A.props(".hdr-stats b", ["color"])).color;
    await s.expect("hovering an inactive tab turns its label to ink", async () => (await A.props(tabBtn("Metro"), ["color"])).color, ink);
    await s.pin("the hovered tab's pill", await A.props(tabBtn("Metro").locator(".ic"), ["background-color", "width", "height", "border-top-left-radius"]));
    await tabBtn("Line").hover();
    await s.expect("hovering the current tab leaves it in the accent", async () => (await A.props(tabBtn("Line"), ["color"])).color, ACCENT.google.light);
    await s.pin("the current tab's pill", await A.props(tabBtn("Line").locator(".ic"), ["background-color", "width", "height", "border-top-left-radius", "transition-duration"]));
    await s.pin("a tab's own geometry", { tab: await A.props(tabBtn("Line"), ["font-size", "font-weight", "letter-spacing", "gap", "padding-top", "border-top-left-radius", "transition-duration", "flex-grow"]), rect: await A.rect(tabBtn("Line")) });
    await page.mouse.move(640, 3);

    // ---- the keyboard
    await tabBtn("Line").click();
    for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
    await s.expect("Tab from the Line tab three times lands on Me and shows a focus ring", () => page.evaluate(() => ({ label: document.activeElement.textContent.trim(), visible: document.activeElement.matches(":focus-visible") })), { label: "Me", visible: true });
    await s.expect("the ring is 2px, solid, in the accent, 2px off the tab, with the 6px radius", async () => {
      const p = await A.props(tabBtn("Me"), ["outline-style", "outline-width", "outline-color", "outline-offset", "border-top-left-radius"]);
      return { ...p, "outline-color": p["outline-color"] === ACCENT.google.light };
    }, { "outline-style": "solid", "outline-width": "2px", "outline-color": true, "outline-offset": "2px", "border-top-left-radius": "6px" });
    await page.keyboard.press("Enter");
    await s.expect("Enter on the focused tab opens it", async () => ({ view: await view(page), bar: (await tabBar(page)).tabs.map((t) => t.current) }), { view: { views: 1, h1: H1.Me, on: "view on" }, bar: [null, null, null, "page"] });
    await A.tab("Line");

    // ---- the accent and the pictures
    await s.expect("the current tab wears the accent (Google blue)", async () => (await A.props(tabBtn("Line"), ["color"])).color, ACCENT.google.light);
    await s.expect("nothing overflows the width of the window", () => noHScroll(page), true);
    await s.marked(A, "the header", "header.hdr");
    await s.marked(A, "the tab bar", "nav.tabs");
    await A.shot("shell");
    await A.shot("header", { locator: page.locator("header.hdr") });
    await A.shot("tabbar", { locator: page.locator("nav.tabs") });
    await A.setDark(true);
    await s.expect("in the dark palette the accent is the lighter blue", async () => (await A.props(tabBtn("Line"), ["color"])).color, ACCENT.google.dark);
    await A.shot("shell");
    await A.shot("header", { locator: page.locator("header.hdr") });
    await A.shot("tabbar", { locator: page.locator("nav.tabs") });

    // ---- the other line tints the whole app
    const L = await s.device({ seed: F.awsMid, motion: true });
    await L.open();
    const lp = L.page;
    const lbtn = (label) => lp.locator("nav.tabs").getByRole("button", { name: label, exact: true });
    const lm = hdrModel(F.awsMid);
    await s.expect("riding the Local at boot: data-track is aws", () => lp.evaluate(() => document.documentElement.dataset.track), "aws");
    await s.expect("the Local's header: its own ladder (Phone Screen at 110 XP), stops not days", () => hdr(lp), lm);
    await s.expect("…spelled out: Phone Screen, ink, 'Stop 3 | Ballard Locks', the next rank is Phone Screen", () => hdr(lp), { rank: "Phone Screen", dot: "var(--aws-ink)", streak: "Streak 2/2", xp: String(F.awsMid.tracks.aws.xp), fill: rankModel("aws", F.awsMid.tracks.aws.xp).pct + "%", where: "Stop 3 | Ballard Locks", next: rankModel("aws", F.awsMid.tracks.aws.xp).next });
    await s.expect("the current tab wears the Local's orange", async () => (await L.props(lbtn("Line"), ["color"])).color, ACCENT.aws.light);
    await s.expect("the XP bar runs through teal, orange and rust (not the four logo colours)", async () => (await L.props(".xp-fill", ["background-image"]))["background-image"], (g) => ["rgb(11, 122, 135)", "rgb(217, 105, 11)", "rgb(182, 70, 31)"].every((c) => g.includes(c)) && !g.includes("rgb(26, 115, 232)"));
    await s.expect("the Local's focus ring is orange too", async () => {
      await lbtn("Line").click();
      for (let i = 0; i < 3; i++) await lp.keyboard.press("Tab");
      return (await L.props(lbtn("Me"), ["outline-color"]))["outline-color"];
    }, ACCENT.aws.light);
    await L.page.mouse.move(640, 3);
    await L.shot("shell-local");
    await L.setDark(true);
    await s.expect("in the dark palette the Local's accent is the brighter orange", async () => (await L.props(lbtn("Line"), ["color"])).color, ACCENT.aws.dark);
    await s.expect("…and the bar's teal, orange and rust are the dark palette's", async () => (await L.props(".xp-fill", ["background-image"]))["background-image"], (g) => ["rgb(69, 194, 207)", "rgb(255, 153, 0)", "rgb(242, 135, 95)"].every((c) => g.includes(c)));
    await L.shot("shell-local");

    // ---- a fresh profile
    const N = await s.device({});
    await N.open();
    await s.expect("a fresh profile: Wanderer, blue dot, streak 0, XP 0, the bar empty, Day 1 Pathfinding, 100 XP to Pathfinder", () => hdr(N.page), { rank: "Wanderer", dot: "var(--blue)", streak: "Streak 0/0", xp: "0", fill: "0%", where: "Day 1 | Pathfinding", next: "100 XP to Pathfinder" });
    await s.expect("a fresh profile has saved nothing yet", () => N.blob(), null);

    // ---- the editor arrives lazily: a bare, busy cover until its code is in
    const W = await s.device({ seed: F.mid, motion: true });
    let release;
    const gate = new Promise((r) => (release = r));
    await W.ctx.route(/\/assets\/Workspace-[^/]*\.js$/, async (route) => {
      await gate;
      await route.fallback();
    });
    await W.open();
    await W.page.locator(".linewrap > .stn").nth(2).locator("button.golink").first().click();
    await s.expect("pressing an editor button while the editor's code is still on the way puts a cover over the whole window: .ws-boot, aria-busy, nothing in it", () => W.page.locator(".ws-boot").evaluate((e) => ({ busy: e.getAttribute("aria-busy"), kids: e.children.length, text: e.textContent })), { busy: "true", kids: 0, text: "" });
    await s.expect("…it is fixed to all four edges at level 50 in the page colour, over the header (30) and the tab bar (40); the workspace itself has not appeared", async () => ({ p: await W.props(".ws-boot", ["position", "inset", "z-index", "background-color"]), ws: await W.page.locator(".ws").count(), covers: await W.page.evaluate(() => [document.elementFromPoint(640, 20), document.elementFromPoint(300, 840)].map((e) => e.classList.contains("ws-boot"))) }), { p: { position: "fixed", inset: "0px", "z-index": "50", "background-color": "rgb(248, 249, 250)" }, ws: 0, covers: [true, true] });
    await W.shot("workspace-boot");
    release();
    await s.expect("once the code is in the cover goes and the workspace takes its place", async () => ({ boot: await W.page.locator(".ws-boot").count(), ws: await W.page.locator('.ws[role="dialog"]').count() }), { boot: 0, ws: 1 });
    finish(s);
  });
}
