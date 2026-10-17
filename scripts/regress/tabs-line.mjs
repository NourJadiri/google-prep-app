// The Line tab's structure (02): hero, the transit rail and its stations, day cards open and closed, problem rows
// and their links, the terminus, both lines. Checking, milestones and the picker are in tabs-check.mjs and
// tabs-picker.mjs; the mock clock in tabs-timer.mjs.

import { finish } from "./me-lib.mjs";
import { F, heroLine, rail, railModel, rowsAt, rowsModel, ritualAt, terminusCopy, noHScroll, clearedOf, doneCount, totalOf, planOf } from "./tabs-kit.mjs";

export const RGB = { blue: "rgb(26, 115, 232)", red: "rgb(217, 48, 37)", yellow: "rgb(249, 171, 0)", green: "rgb(30, 142, 62)", ink: "rgb(32, 33, 36)", orange: "rgb(217, 105, 11)", teal: "rgb(11, 122, 135)", awsInk: "rgb(35, 47, 62)", rust: "rgb(182, 70, 31)", line: "rgb(218, 220, 224)", ink2: "rgb(95, 99, 104)" };
const SEG_RGB = { "var(--blue)": RGB.blue, "var(--red)": RGB.red, "var(--yellow)": RGB.yellow, "var(--green)": RGB.green, "var(--aws-orange)": RGB.orange, "var(--aws-teal)": RGB.teal, "var(--aws-ink)": RGB.awsInk, "var(--aws-rust)": RGB.rust };

export const dayHead = (page, pos) => page.locator(".linewrap > .stn").nth(pos).locator(".dayhead");
export const stn = (page, pos) => page.locator(".linewrap > .stn").nth(pos);

export default function register(scenario) {
  /* 2 ------------------------------------------------------------------ */
  scenario("02-line-rail", "the Line: hero, the rail and its stations, day cards open and closed, rows, links, the terminus, both lines", async (s) => {
    const A = await s.device({ seed: F.mid, motion: true });
    await A.open();
    const page = A.page;
    const blob = F.mid;
    const open = ["d3"];

    // ---- hero and stats
    await s.expect("the hero: 'Onsite Express', the Google line's blurb, and the counts of problems and stations", () => heroLine(page), {
      title: "Onsite Express",
      bold: "Express",
      blurb: "Two rounds between you and the terminus. Twenty-four stations, one line. Board anywhere.",
      stats: `${doneCount(blob)} / ${totalOf("google")} problems · ${clearedOf(blob)} / 24 stations cleared`,
    });
    await s.expect("…which for the seeded progress is 10 / 115 problems · 2 / 24 stations cleared", () => page.locator(".linestats").textContent(), "10 / 115 problems · 2 / 24 stations cleared");
    await s.expect("four logo-coloured dots above the title", () => page.locator(".gdots i").evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor)), [RGB.blue, RGB.red, RGB.yellow, RGB.green]);

    // ---- the rail
    const model = railModel(blob, open);
    await s.expect("24 stations and the terminus, in order: ridden ones done, the focus day now, only the focus day open", () => rail(page), model.days);
    await s.expect("the stations by name: day 1 Pathfinding first, day 24 Final Approach last, then GOOGLE", async () => {
      const r = await rail(page);
      return [r[0].eyebrow, r[1].eyebrow, r[2].eyebrow, r[23].eyebrow, r[24].title];
    }, ["Day 1 · Pathfinding", "Day 2 · Backtrack Jct.", "Day 3 · Constraint St.", "Day 24 · Final Approach", "GOOGLE"]);
    await s.expect("each station's --seg is its phase colour (the data's colours, in order)", async () => (await rail(page)).slice(0, 24).map((r) => r.seg), planOf("google").map((d) => d.color));
    await s.expect("every station card is on the page, open or not: 24 day bodies, 24 ritual rows, 115 problem rows", () => page.evaluate(() => ({ bodies: document.querySelectorAll(".daybody").length, rituals: document.querySelectorAll(".daybody .ritual").length, rows: document.querySelectorAll(".prow").length })), { bodies: 24, rituals: 24, rows: 115 });
    await s.expect("closed bodies are display:none, the open one is a block", () => page.locator(".daybody").evaluateAll((els) => els.map((e) => getComputedStyle(e).display).filter((d, i) => i === 2 || d !== "none")), ["block"]);
    await s.expect("the terminus card reads GOOGLE and counts the stations behind you", async () => ({ copy: await terminusCopy(page), title: (await rail(page))[24].title }), { copy: model.terminusCopy, title: "GOOGLE" });
    await s.expect("…2 of 24 stations behind you. The terminus isn't going anywhere — you are.", () => terminusCopy(page), "2 of 24 stations behind you. The terminus isn't going anywhere — you are.");

    // ---- the rail's drawing: the segment, its trims, the stop
    const before = (sel) => A.props(sel, ["content", "position", "top", "width", "left", "height", "background-color", "transform"], "::before");
    const first = await before(".linewrap > .stn:first-child .rail");
    const second = await before(".linewrap > .stn:nth-child(2) .rail");
    const last = await before(".linewrap > .stn:last-child .rail");
    const bar = (p) => ({ content: p.content, pos: p.position, top: p.top, width: p.width, left: p.left, bg: p["background-color"], shift: p.transform });
    await s.expect("a station's rail segment is a 5px bar in its colour, centred on the rail; the first starts 14px down, at the first dot", async () => ({ first: bar(first), second: bar(second) }), {
      first: { content: '""', pos: "absolute", top: "14px", width: "5px", left: "17px", bg: RGB.blue, shift: "matrix(1, 0, 0, 1, -2.5, 0)" },
      second: { content: '""', pos: "absolute", top: "0px", width: "5px", left: "17px", bg: RGB.red, shift: "matrix(1, 0, 0, 1, -2.5, 0)" },
    });
    await s.expect("the terminus's segment is the grey line colour and only 14px long: it ends at its dot", async () => ({ ...bar(last), height: last.height }), { content: '""', pos: "absolute", top: "0px", width: "5px", left: "17px", bg: RGB.line, shift: "matrix(1, 0, 0, 1, -2.5, 0)", height: "14px" });
    const stop = (sel) => A.props(sel, ["width", "height", "border-top-width", "border-top-style", "border-top-color", "background-color", "margin-top", "border-top-left-radius", "z-index", "color"]);
    await s.expect("a cleared station's dot is 22px, ringed 4px in its colour and filled with it, a tick inside", async () => ({ stop: await stop(".linewrap > .stn:first-child .stop"), tick: (await rail(page))[0].tick }), {
      stop: { width: "22px", height: "22px", "border-top-width": "4px", "border-top-style": "solid", "border-top-color": RGB.blue, "background-color": RGB.blue, "margin-top": "8px", "border-top-left-radius": "50%", "z-index": "1", color: "rgb(255, 255, 255)" },
      tick: "check",
    });
    await s.expect("the focus station's dot is hollow (the surface colour) in its colour's ring", async () => {
      const p = await stop(".stn.now .stop");
      return { bg: p["background-color"], ring: p["border-top-color"] };
    }, { bg: "rgb(255, 255, 255)", ring: RGB.red });
    await s.pin("the focus station's halo", (await A.props(".stn.now .stop", ["box-shadow"]))["box-shadow"]);
    await s.expect("a station still to ride has the hollow dot too and no halo", async () => {
      const p = await A.props(".linewrap > .stn:nth-child(5) .stop", ["background-color", "box-shadow", "border-top-color"]);
      return { bg: p["background-color"], shadow: p["box-shadow"], ring: p["border-top-color"] };
    }, { bg: "rgb(255, 255, 255)", shadow: "none", ring: RGB.green });
    await s.expect("the terminus dot is a 26px roundel drawn as a four-colour conic gradient, no border", async () => {
      const p = await A.props(".terminus .stop", ["width", "height", "border-top-width", "background-image"]);
      return { w: p.width, h: p.height, b: p["border-top-width"], conic: p["background-image"].startsWith("conic-gradient"), colours: [RGB.blue, RGB.red, RGB.yellow, RGB.green].every((c) => p["background-image"].includes(c)) };
    }, { w: "26px", h: "26px", b: "0px", conic: true, colours: true });

    // ---- the day cards
    await s.expect("a day card: the eyebrow is the station, the title below it, a hairline of progress, a chevron", () => stn(page, 2).locator(".daycard").evaluate((c) => ({
      head: c.querySelector(".dayhead").tagName + "[aria-expanded=" + c.querySelector(".dayhead").getAttribute("aria-expanded") + "]",
      eyebrow: c.querySelector(".eyebrow").textContent,
      title: c.querySelector("h2").textContent,
      chev: window.__glyph(c.querySelector(".chev svg")),
      prog: c.querySelector(".dayprog i").style.width,
      note: c.querySelector(".daynote").textContent,
    })), { head: "BUTTON[aria-expanded=true]", eyebrow: "Day 3 · Constraint St.", title: "Backtracking under constraints", chev: "chevron-down", prog: "50%", note: "Same skeleton, harder pruning: palindrome checks, phone pads, and both diagonals." });
    await s.expect("the eyebrow is uppercase mono in the station's colour, the title 15.5px semibold", async () => ({
      eyebrow: await A.props(stn(page, 2).locator(".eyebrow"), ["color", "text-transform", "font-size", "letter-spacing", "font-weight"]),
      title: await A.props(stn(page, 2).locator(".daycard h2"), ["font-size", "font-weight"]),
    }), { eyebrow: { color: RGB.red, "text-transform": "uppercase", "font-size": "10px", "letter-spacing": "1.2px", "font-weight": "700" }, title: { "font-size": "15.5px", "font-weight": "600" } });
    await s.expect("the progress hairline is 3px, filled in the station's colour: days 1 and 2 full, day 3 half, day 4 empty", () => page.locator(".dayprog").evaluateAll((els) => els.slice(0, 4).map((e) => ({ h: getComputedStyle(e).height, w: e.querySelector("i").style.width, c: getComputedStyle(e.querySelector("i")).backgroundColor }))), [{ h: "3px", w: "100%", c: RGB.blue }, { h: "3px", w: "100%", c: RGB.red }, { h: "3px", w: "50%", c: RGB.red }, { h: "3px", w: "0%", c: RGB.yellow }]);
    await s.expect("the open card's chevron is turned over; a closed one's is not", async () => page.locator(".chev").evaluateAll((els) => [getComputedStyle(els[2]).transform, getComputedStyle(els[3]).transform]), ["matrix(-1, 0, 0, -1, 0, 0)", "none"]);

    // ---- rows
    await s.expect("the open day's rows: names, difficulty chips, xp, tags, the editor button", () => rowsAt(page, 2), rowsModel(blob, "d3"));
    await s.expect("…in words: two done (Letter Combinations, Palindrome Partitioning), N-Queens HARD +40 XP, Top K Frequent MED warm-up", async () => {
      const r = await rowsAt(page, 2);
      return r.map((x) => `${x.pressed === "true" ? "[x]" : "[ ]"} ${x.name} ${x.diff.split(":")[1]} ${x.xp}${x.tags.length ? " " + x.tags.join(",") : ""}`);
    }, ["[x] Letter Combinations of a Phone Number MED +20 XP", "[x] Palindrome Partitioning MED +20 XP", "[ ] N-Queens HARD +40 XP", "[ ] Top K Frequent Elements MED +20 XP tag:warm-up"]);
    const rowProps = (pos, k, sel, props) => A.props(stn(page, pos).locator(".prow").nth(k).locator(sel), props);
    await s.expect("a done row's check circle is filled in its station's colour with a white tick; a pending one is an empty 26px ring in the line grey", async () => ({
      done: await rowProps(2, 0, ".pcheck", ["width", "height", "background-color", "border-top-color", "border-top-width", "color"]),
      pending: await rowProps(2, 2, ".pcheck", ["width", "height", "background-color", "border-top-color", "border-top-width", "color"]),
    }), {
      done: { width: "26px", height: "26px", "background-color": RGB.red, "border-top-color": RGB.red, "border-top-width": "2px", color: "rgb(255, 255, 255)" },
      pending: { width: "26px", height: "26px", "background-color": "rgba(0, 0, 0, 0)", "border-top-color": RGB.line, "border-top-width": "2px", color: "rgba(0, 0, 0, 0)" },
    });
    await s.expect("a done name is struck through (1px) in the secondary grey; a pending one is ink", async () => ({
      done: await rowProps(2, 0, ".pname", ["color", "text-decoration-line", "text-decoration-thickness", "font-size", "font-weight"]),
      pending: await rowProps(2, 2, ".pname", ["color", "text-decoration-line", "font-size", "font-weight"]),
    }), {
      done: { color: RGB.ink2, "text-decoration-line": "line-through", "text-decoration-thickness": "1px", "font-size": "14px", "font-weight": "500" },
      pending: { color: RGB.ink, "text-decoration-line": "none", "font-size": "14px", "font-weight": "500" },
    });
    await s.expect("the difficulty chips: mono 9.5px bold pills in green (easy), orange (medium) and red (hard), ringed in the same colour", () => page.locator(".prow .diff").evaluateAll((els) => {
      const seen = {};
      for (const e of els) {
        const cs = getComputedStyle(e);
        seen[e.textContent] ??= { color: cs.color, ring: cs.borderTopColor, size: cs.fontSize, weight: cs.fontWeight, tracking: cs.letterSpacing, ringWidth: cs.borderTopWidth, radius: cs.borderTopLeftRadius };
      }
      return seen;
    }), {
      EASY: { color: RGB.green, ring: RGB.green, size: "9.5px", weight: "700", tracking: "0.57px", ringWidth: "1px", radius: "999px" },
      MED: { color: "rgb(232, 113, 10)", ring: "rgb(232, 113, 10)", size: "9.5px", weight: "700", tracking: "0.57px", ringWidth: "1px", radius: "999px" },
      HARD: { color: RGB.red, ring: RGB.red, size: "9.5px", weight: "700", tracking: "0.57px", ringWidth: "1px", radius: "999px" },
    });
    await s.pin("a chip's tinted fill", (await A.props(page.locator(".prow .diff.M").first(), ["background-color"]))["background-color"]);
    await s.expect("tags and XP are small mono: the warm-up tag uppercase grey 9.5px, the XP 10.5px grey with tabular figures", async () => ({
      tag: await rowProps(2, 3, ".tag", ["font-size", "text-transform", "color", "letter-spacing"]),
      xp: await rowProps(2, 3, ".xpv", ["font-size", "color", "font-variant-numeric"]),
    }), { tag: { "font-size": "9.5px", "text-transform": "uppercase", color: RGB.ink2, "letter-spacing": "0.57px" }, xp: { "font-size": "10.5px", color: RGB.ink2, "font-variant-numeric": "tabular-nums" } });
    await s.expect("the editor button is a 34px round in the accent with a code glyph", async () => ({
      p: await rowProps(2, 2, ".golink", ["width", "height", "border-top-left-radius", "color"]),
      glyph: await stn(page, 2).locator(".prow").nth(2).locator(".golink").evaluate((g) => window.__glyph(g.querySelector("svg"))),
    }), { p: { width: "34px", height: "34px", "border-top-left-radius": "50%", color: RGB.blue }, glyph: "code" });
    await s.pin("the editor button's tint", (await rowProps(2, 2, ".golink", ["background-color"]))["background-color"]);
    await s.expect("a station's ritual row sits above its problems: text, +15, the dashed outline in its colour", () => ritualAt(page, 2), { cls: "ritual", pressed: "false", text: planOf("google")[2].ritual, xp: "+15", fill: "", tick: "check" });
    await s.expect("the ritual's outline is dashed in the station's colour (a 1.5px rule, which a 1x screen draws as 1px) until it is done", () => A.props(stn(page, 2).locator(".ritual"), ["border-top-style", "border-top-width", "border-top-color", "border-top-left-radius"]), { "border-top-style": "dashed", "border-top-width": "1px", "border-top-color": RGB.red, "border-top-left-radius": "10px" });

    // ---- the pictures
    await s.marked(A, "the line (the rail and every card)", ".linewrap");
    await s.marked(A, "the hero", "main .hero");
    await A.shot("line", { tall: true });
    await A.setDark(true);
    await A.shot("line", { tall: true });
    await A.setDark(false);

    // ---- opening and closing cards
    await dayHead(page, 3).click();
    open.push("d4");
    await s.expect("pressing a closed day opens it: aria-expanded flips, the station is .open, its body shows, its chevron turns", async () => {
      const r = (await rail(page))[3];
      return { cls: r.cls, expanded: r.expanded, display: (await A.props(stn(page, 3).locator(".daybody"), ["display"])).display, chev: (await A.props(stn(page, 3).locator(".chev"), ["transform"])).transform };
    }, { cls: "stn open", expanded: "true", display: "block", chev: "matrix(-1, 0, 0, -1, 0, 0)" });
    await s.expect("days are not an accordion: the focus day stays open beside it", async () => (await rail(page)).map((r) => r.expanded).slice(0, 5), ["false", "false", "true", "true", "false"]);
    await dayHead(page, 2).click();
    open.splice(open.indexOf("d3"), 1);
    await s.expect("pressing an open day closes it: aria-expanded false, the body hidden but still on the page, rows intact", async () => ({
      expanded: (await rail(page))[2].expanded,
      cls: (await rail(page))[2].cls,
      display: (await A.props(stn(page, 2).locator(".daybody"), ["display"])).display,
      rows: (await rowsAt(page, 2)).length,
    }), { expanded: "false", cls: "stn now", display: "none", rows: 4 });
    await dayHead(page, 2).click();
    open.push("d3");
    for (const pos of [0, 6, 10, 22]) {
      await dayHead(page, pos).click();
      open.push(planOf("google")[pos].id);
    }
    await s.expect("the rail with six cards open (days 4, 3, 1, 7, 11, 23) is still the model", async () => (await rail(page)).map((r) => r.cls), railModel(blob, open).days.map((r) => r.cls));
    await s.expect("day 1: the rows, with 'passed' on the two problems accepted in the editor and a warm-up tag on the last", () => rowsAt(page, 0), rowsModel(blob, "d1"));
    await s.expect("day 1's ritual is done (logged on the 1st): solid outline, the check filled in the station's colour", () => ritualAt(page, 0), { cls: "ritual done", pressed: "true", text: planOf("google")[0].ritual, xp: "+15", fill: "var(--blue)", tick: "check" });
    await s.expect("day 7: the timed mock row has a 30 XP award and leaves the app (a link, not the editor)", async () => (await rowsAt(page, 6)).at(-1), rowsModel(blob, "d7").at(-1));
    await s.expect("…its link is the repo's address, in a new tab, noopener, with the arrow glyph", async () => (await rowsAt(page, 6)).at(-1).link, { tag: "A", cls: "golink", label: "Open Timed mock — random Google-tagged medium", title: null, href: "https://github.com/liquidslr/leetcode-company-wise-problems", target: "_blank", rel: "noopener", glyph: "arrow-up-right" });
    await s.expect("day 7: the other rows are in-app, and one mock clock is mounted in the card", async () => ({ rows: await rowsAt(page, 6), timers: await stn(page, 6).locator(".timer").count() }), { rows: rowsModel(blob, "d7"), timers: 1 });
    await s.expect("day 11: Walls and Gates is a premium drill (tag 'premium', still the editor), Combination Sum a warm-up", () => rowsAt(page, 10), rowsModel(blob, "d11"));
    await s.expect("day 23: a premium drill, an original one (tag 'original') and a warm-up", () => rowsAt(page, 22), rowsModel(blob, "d23"));
    await s.expect("every station with a mock has a clock: days 7, 18, 22 and 24, none elsewhere", () => page.locator(".linewrap > .stn").evaluateAll((els) => els.map((e, i) => (e.querySelector(".timer") ? i + 1 : 0)).filter(Boolean)), [7, 18, 22, 24]);
    await s.expect("every row but the four mocks opens the editor: 111 code buttons, 4 external links", () => page.evaluate(() => ({ code: document.querySelectorAll(".prow button.golink.code").length, ext: document.querySelectorAll(".prow a.golink").length })), { code: 111, ext: 4 });

    // ---- open state survives a trip to another tab
    await A.tab("Metro");
    await A.tab("Line");
    await s.expect("after Metro and back, the same cards are open", async () => (await rail(page)).map((r, i) => (r.expanded === "true" ? planOf("google")[i].id : null)).filter(Boolean), ["d1", "d3", "d4", "d7", "d11", "d23"]);

    // ---- the ways out of a row: an external link, and the editor
    await A.ctx.route("https://github.com/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<title>stub</title>" }));
    const [popup] = await Promise.all([A.ctx.waitForEvent("page"), stn(page, 6).locator("a.golink").click()]);
    await s.expect("the mock's link opens the repo in a new tab", () => popup.url(), "https://github.com/liquidslr/leetcode-company-wise-problems");
    await popup.close();
    await s.expect("…leaving this page as it was: still the Line, nothing checked, no toast", async () => ({ toasts: await A.toastLog(), mock: (await A.saved()).tracks.google.done.mock ?? null, work: await page.locator(".ws").count() }), { toasts: [], mock: null, work: 0 });
    await A.resume();
    await stn(page, 0).locator(".prow").nth(0).locator("button.golink").click();
    await s.expect("the editor button opens the workspace over the line, for that problem", () => page.locator('.ws[role="dialog"]').getAttribute("aria-label"), "All Paths From Source to Target");
    await s.expect("…and nothing was toggled by going there (the row stays done)", async () => ({ pressed: (await rowsAt(page, 0))[0].pressed, hash: await page.evaluate(() => location.hash), body: await page.evaluate(() => document.body.style.overflow) }), { pressed: "true", hash: "", body: "hidden" });
    await page.getByRole("button", { name: "Back to the line" }).click();
    await s.expect("Back to the line closes it: the page behind is as it was", async () => ({ ws: await page.locator(".ws").count(), body: await page.evaluate(() => document.body.style.overflow), h1: (await heroLine(page)).title }), { ws: 0, body: "", h1: "Onsite Express" });

    // ---- the Local
    const L = await s.device({ seed: F.awsMid, motion: true });
    await L.open();
    const lp = L.page;
    const lb = F.awsMid;
    await s.expect("the Local's hero: its name, blurb and counts (the Google line's progress is not counted here)", () => heroLine(lp), {
      title: "Day One Local",
      bold: "Local",
      blurb: "The slow train to Amazon. Thirteen stops, one idea each, easy problems only — and no timetable. The Local waits for you.",
      stats: `${doneCount(lb)} / ${totalOf("aws")} problems · ${clearedOf(lb)} / 13 stations cleared`,
    });
    await s.expect("…11 / 55 problems · 2 / 13 stations cleared", () => lp.locator(".linestats").textContent(), "11 / 55 problems · 2 / 13 stations cleared");
    await s.expect("the Local's rail: thirteen stops in its colours and the terminus, the focus stop open", () => rail(lp), railModel(lb, ["a3"]).days);
    await s.expect("…its terminus is DAY ONE and counts stops, not stations", async () => ({ title: (await rail(lp))[13].title, copy: await terminusCopy(lp) }), { title: "DAY ONE", copy: "2 of 13 stops behind you. There's no timetable on the Local — ride when you can." });
    await s.expect("the stops' eyebrows say Stop, not Day", async () => (await rail(lp)).slice(0, 3).map((r) => r.eyebrow), ["Stop 1 · Pike Place", "Stop 2 · Pioneer Square", "Stop 3 · Ballard Locks"]);
    await s.expect("the Local has no morning rituals and no mock clocks, and its rows carry one 'passed' tag and no others", () => lp.evaluate(() => ({ rituals: document.querySelectorAll(".ritual").length, timers: document.querySelectorAll(".timer").length, tags: [...document.querySelectorAll(".prow .tag")].map((t) => t.textContent) })), { rituals: 0, timers: 0, tags: ["passed"] });
    await s.expect("stop 3's rows: easy only, +10 XP each, the editor for all, and 'passed' on the one accepted", () => rowsAt(lp, 2), rowsModel(lb, "a3"));
    await dayHead(lp, 0).click();
    await s.expect("stop 1's rows: all four done", () => rowsAt(lp, 0), rowsModel(lb, "a1"));
    await s.expect("every row of the Local opens the editor (55), none leaves the app", () => lp.evaluate(() => ({ code: document.querySelectorAll(".prow button.golink.code").length, ext: document.querySelectorAll(".prow a.golink").length })), { code: 55, ext: 0 });
    await s.expect("the Local's terminus dot is a conic gradient in orange, teal, ink and rust", async () => {
      const g = (await L.props(".terminus .stop", ["background-image"]))["background-image"];
      return g.startsWith("conic-gradient") && [RGB.orange, RGB.teal, RGB.awsInk, RGB.rust].every((c) => g.includes(c));
    }, true);
    await s.expect("the Local's stations take the Local's colours", async () => (await rail(lp)).slice(0, 13).map((r) => SEG_RGB[r.seg]), planOf("aws").map((d) => SEG_RGB[d.color]));
    await s.expect("the Local's hero dots are orange, teal, ink and rust", () => lp.locator(".gdots i").evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor)), [RGB.orange, RGB.teal, RGB.awsInk, RGB.rust]);
    await s.expect("nothing overflows the width of the window", () => noHScroll(lp), true);
    await dayHead(lp, 0).click();
    await s.marked(L, "the Local's line", ".linewrap");
    await L.shot("line-local", { tall: true });
    await L.setDark(true);
    await s.expect("in the dark palette the Local's hero dots are its brighter colours", () => lp.locator(".gdots i").evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor)), ["rgb(255, 153, 0)", "rgb(69, 194, 207)", "rgb(182, 194, 204)", "rgb(242, 135, 95)"]);
    await L.shot("line-local", { tall: true });
    finish(s);
  });
}
