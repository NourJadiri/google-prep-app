// The phone (390x844, touch): the 44px hit areas the ::after overlays give the small controls (13), and each tab's
// layout in both palettes (14: shell and Line, 15: Metro and Dojo).

import { finish } from "./me-lib.mjs";
import { F, hdr, hdrModel, heroLine, rail, railModel, noHScroll, tabBar, view, scrollToStn } from "./tabs-kit.mjs";
import { board, boardModel, card, result, cardOf } from "./tabs-metro-kit.mjs";
import { stn, dayHead } from "./tabs-line.mjs";
import { chooseDeck, boardIt, rush, boardBtn, nextBtn, quitBtn } from "./tabs-metro.mjs";

/** Bring `loc` to the middle of the window, clear of the header and the tab bar. */
const centre = (loc) => loc.evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));

/** The overlay box the CSS asks for, from the control's own box: `{ size }` is a square of that side centred on it
 *  (the check circle and the editor button); `{ t, r, b, l }` is how far each edge of its padding box is pushed out
 *  (`inset: -3px 0`). Then: do the points 1px inside each edge of that box hit the control, and the points 2px beyond
 *  each edge miss it? (An overlay is part of its control, so elementFromPoint names the control.) */
async function overlay(s, A, label, loc, spec) {
  await centre(loc);
  const m = await loc.evaluate((el, sp) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const bw = (k) => parseFloat(cs.getPropertyValue("border-" + k + "-width"));
    let box;
    if (sp.size) {
      const cx = r.x + r.width / 2;
      const cy = r.y + r.height / 2;
      box = { l: cx - sp.size / 2, r: cx + sp.size / 2, t: cy - sp.size / 2, b: cy + sp.size / 2 };
    } else {
      box = { l: r.x + bw("left") - sp.l, r: r.x + r.width - bw("right") + sp.r, t: r.y + bw("top") - sp.t, b: r.y + r.height - bw("bottom") + sp.b };
    }
    const mx = (box.l + box.r) / 2;
    const my = (box.t + box.b) / 2;
    const hit = (pts) => pts.map(([x, y]) => { const h = document.elementFromPoint(x, y); return !!h && el.contains(h); });
    return {
      drawn: [Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10],
      area: [Math.round((box.r - box.l) * 10) / 10, Math.round((box.b - box.t) * 10) / 10],
      inside: hit([[box.l + 1, my], [box.r - 1, my], [mx, box.t + 1], [mx, box.b - 1]]),
      outside: hit([[box.l - 2, my], [box.r + 2, my], [mx, box.t - 2], [mx, box.b + 2]]),
    };
  }, spec);
  await s.expect(`${label} (drawn ${m.drawn.join("x")}, hit area ${m.area.join("x")}): the points 1px inside the four edges of its overlay hit it`, async () => m.inside, [true, true, true, true]);
  await s.expect(`${label}: the points 2px beyond the four edges do not`, async () => m.outside, [false, false, false, false]);
  return m;
}

export default function register(scenario) {
  /* 13 ----------------------------------------------------------------- */
  scenario("13-touch-targets", "touch targets on a phone: the ::after overlays give the small controls their ~44px hit areas", async (s) => {
    const P = await s.device({ seed: F.mock, phone: true, motion: true });
    await P.open();
    const page = P.page;
    const d7 = 6;
    const row = (k) => stn(page, d7).locator(".prow").nth(k);

    // ---- the Line
    await s.expect("a check circle is drawn 26px and its editor button 34px; each has a 44px overlay behind it", async () => ({
      circle: await P.rect(row(0).locator(".pcheck")).then((r) => [r.w, r.h]),
      link: await P.rect(row(0).locator(".golink")).then((r) => [r.w, r.h]),
      circleAfter: await P.props(row(0).locator(".pcheck"), ["width", "height"], "::after"),
      linkAfter: await P.props(row(0).locator(".golink"), ["width", "height"], "::after"),
    }), { circle: [26, 26], link: [34, 34], circleAfter: { width: "44px", height: "44px" }, linkAfter: { width: "44px", height: "44px" } });
    await overlay(s, P, "the check circle", row(0).locator(".pcheck"), { size: 44 });
    await overlay(s, P, "the editor button", row(0).locator(".golink"), { size: 44 });
    await overlay(s, P, "the mock's external link", row(2).locator("a.golink"), { size: 44 });
    await overlay(s, P, "the ritual row", stn(page, d7).locator(".ritual"), { l: 0, r: 0, t: 3, b: 3 });
    await overlay(s, P, "the clock's Start button", stn(page, d7).locator(".timer .tbtn").nth(0), { l: 2, r: 2, t: 7, b: 7 });
    await overlay(s, P, "the clock's Reset button", stn(page, d7).locator(".timer .tbtn").nth(1), { l: 2, r: 2, t: 7, b: 7 });
    await s.expect("the overlays stay inside each row: consecutive check circles are at least 44px apart, so no two targets overlap", async () => {
      const ys = await stn(page, d7).locator(".prow .pcheck").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
      return ys.slice(1).every((y, i) => y - ys[i] >= 44);
    }, true);
    await s.expect("the editor button's overlay and the check circle's share a row without touching (circle on the left, link on the right)", async () => {
      const a = await P.rect(row(0).locator(".pcheck"));
      const b = await P.rect(row(0).locator(".golink"));
      return b.x - (a.x + a.w) > 44;
    }, true);
    await s.pin("the overlays as the browser computes them", {
      circle: await P.props(row(0).locator(".pcheck"), ["position", "top", "left", "width", "height", "transform", "inset"], "::after"),
      link: await P.props(row(0).locator(".golink"), ["position", "top", "left", "width", "height", "transform", "inset"], "::after"),
      ritual: await P.props(stn(page, d7).locator(".ritual"), ["position", "top", "bottom", "left", "right", "inset"], "::after"),
      tbtn: await P.props(stn(page, d7).locator(".timer .tbtn").first(), ["position", "inset"], "::after"),
    });

    // ---- a tap on the overlay, beside the drawn circle, is a tap on the control
    await centre(row(0).locator(".pcheck"));
    const c2 = await P.rect(row(0).locator(".pcheck"));
    await page.touchscreen.tap(c2.x + c2.w + 7, c2.y + c2.h / 2);
    await s.expect("a tap 7px outside the drawn circle (inside the overlay) ticks the problem", async () => (await row(0).locator(".pcheck").getAttribute("aria-pressed")), "true");
    await page.touchscreen.tap(c2.x + c2.w + 8, c2.y + c2.h / 2);
    await s.expect("a tap 8px outside it (the overlay reaches 9px beyond the circle) is still on it: it unticks again", async () => (await row(0).locator(".pcheck").getAttribute("aria-pressed")), "false");
    const g = await P.rect(row(0).locator(".golink"));
    await page.touchscreen.tap(g.x - 4, g.y + g.h / 2);
    await s.expect("a tap 4px outside the editor button (inside its overlay) opens the workspace", async () => page.locator('.ws[role="dialog"]').count(), 1);
    await page.getByRole("button", { name: "Back to the line" }).click();

    // ---- Metro: a run's own buttons and the result's
    await P.tab("Metro");
    await boardIt(P, 91);
    await s.expect("the options are at least 44px tall, the whole width of the card", async () => (await page.locator("#quizArea .opt").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height >= 44))), [true, true, true, true]);
    const pre = await card(page);
    const q = cardOf(pre);
    await P.press(page.locator("#quizArea .opt").nth(pre.opts.findIndex((o) => o.text === q.o[q.a])));
    await overlay(s, P, "End run", quitBtn(page), { l: 0, r: 0, t: 4, b: 4 });
    await overlay(s, P, "Next stop", nextBtn(page), { l: 0, r: 0, t: 4, b: 4 });
    await P.press(quitBtn(page));
    await s.expect("the departures rows are 60px or taller and the Board button 44px or taller", async () => ({ rows: await page.locator("#quizArea .drow").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height >= 60)), board: (await P.rect(boardBtn(page))).h >= 44 }), { rows: [true, true, true, true, true, true], board: true });
    await boardIt(P, 92);
    await rush(P, "RRRRRRRRRR", { seedBase: 300 });
    await P.press(nextBtn(page));
    await overlay(s, P, "Run it again", page.locator("#quizArea .mbtn").nth(0), { l: 0, r: 0, t: 4, b: 4 });
    await overlay(s, P, "Decks", page.locator("#quizArea .mbtn").nth(1), { l: 0, r: 0, t: 4, b: 4 });
    await s.pin("the .mbtn overlay", await P.props(page.locator("#quizArea .mbtn").first(), ["position", "inset"], "::after"));

    // ---- the Dojo: the veil's button and the log's
    await P.tab("Dojo");
    await page.locator("#dojoArea .tcard").first().locator(".thead").click();
    await overlay(s, P, "the veil's Reveal & diff", page.locator("#dojoArea .tcard").first().locator(".veil button"), { l: 0, r: 0, t: 4, b: 4 });
    await overlay(s, P, "the ritual log's button", page.locator("#dojoArea .dojo-log button"), { l: 0, r: 0, t: 4, b: 4 });
    await s.expect("a template's header row is a full 44px thumb target", async () => (await P.rect(page.locator("#dojoArea .thead").first())).h, 44);

    // ---- the shell
    await P.tab("Line");
    await s.expect("the four tabs and the line picker's two pills are at least 44px tall", async () => ({ tabs: await page.locator("nav.tabs .tab").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height >= 44)), picks: await page.locator(".linepick").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height >= 44)), days: await page.locator(".dayhead").evaluateAll((els) => els.every((e) => e.getBoundingClientRect().height >= 44)) }), { tabs: [true, true, true, true], picks: [true, true], days: true });
    s.pin("sizes of the big controls", { tab: (await P.rect(page.locator("nav.tabs .tab").first())).h, pick: (await P.rect(page.locator(".linepick").first())).h, day: (await P.rect(page.locator(".dayhead").first())).h });
    finish(s);
  });

  /* 14 ----------------------------------------------------------------- */
  scenario("14-phone-line", "the phone: header, tab bar and the Line in both palettes, both lines, the narrowest phone", async (s) => {
    const P = await s.device({ seed: F.mid, phone: true, motion: true });
    await P.open();
    const page = P.page;
    await s.expect("390px: nothing overflows the width of the window", () => noHScroll(page), true);
    await s.expect("the header and tab bar are the desktop's, in a narrower window", async () => ({ hdr: await hdr(page), bar: (await tabBar(page)).tabs.map((t) => t.text), view: await view(page) }), { hdr: hdrModel(F.mid), bar: ["Line", "Metro", "Dojo", "Me"], view: { views: 1, h1: "Onsite Express", on: "view on" } });
    await s.expect("the rail is the same model on a phone: the focus day open, two done, one now", () => rail(page), railModel(F.mid, ["d3"]).days);
    await s.expect("the hero's title shrinks with the window (clamp(26px, 6vw, 36px) is 26px at 390)", async () => (await P.props("main .hero h1", ["font-size"]))["font-size"], "26px");
    await s.expect("both line pills fit on one row", async () => { const rs = await page.locator(".linepick").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top))); return rs[0] === rs[1]; }, true);
    await s.expect("a station card's body is narrower than on desktop but never wider than the window", async () => page.locator(".linewrap").evaluate((e) => e.getBoundingClientRect().right <= innerWidth), true);
    await s.pin("phone geometry of the rail and the picker", { pick: await P.rect(page.locator(".linepick").first()), card: await P.rect(page.locator(".daycard").first()), stop: await P.rect(page.locator(".stop").first()) });
    await P.shot("shell");
    await P.shot("header", { locator: page.locator("header.hdr") });
    await P.shot("tabbar", { locator: page.locator("nav.tabs") });
    await P.shot("line", { tall: true });
    await P.setDark(true);
    await P.shot("shell");
    await P.shot("header", { locator: page.locator("header.hdr") });
    await P.shot("tabbar", { locator: page.locator("nav.tabs") });
    await P.shot("line", { tall: true });
    await P.setDark(false);

    // ---- a mock day, with its clock, on a phone
    await dayHead(page, 6).click();
    await s.expect("the clock row (25:00, Start, Reset and the label) stays inside the card on a phone", async () => stn(page, 6).locator(".timer").evaluate((t) => { const r = t.getBoundingClientRect(); const c = t.closest(".daycard").getBoundingClientRect(); return r.left >= c.left && r.right <= c.right && document.documentElement.scrollWidth <= innerWidth; }), true);
    await s.pin("the clock row on a phone", { timer: await P.rect(stn(page, 6).locator(".timer")), kids: await stn(page, 6).locator(".timer").evaluate((t) => [...t.children].map((c) => { const r = c.getBoundingClientRect(); return [Math.round(r.left * 10) / 10, Math.round(r.top * 10) / 10, Math.round(r.width * 10) / 10]; })) });
    await s.expect("a long problem name wraps inside its row rather than pushing the button off the card", async () => stn(page, 6).locator(".prow").evaluateAll((els) => els.every((li) => { const b = li.querySelector(".golink").getBoundingClientRect(); const c = li.closest(".daycard").getBoundingClientRect(); return b.right <= c.right; })), true);
    await scrollToStn(P, 6, 80);
    await P.shot("mock-day");
    await P.setDark(true);
    await P.shot("mock-day");
    await P.setDark(false);

    // ---- the Local, and the Local on the narrowest phone
    await page.locator(".linepick[data-track='aws']").tap();
    await s.expect("the Local on a phone: its hero and rail, no overflow", async () => ({ title: (await heroLine(page)).title, over: await noHScroll(page) }), { title: "Day One Local", over: true });
    await P.scrollTo(0);
    await P.shot("line-local", { tall: true });
    await P.setDark(true);
    await P.shot("line-local", { tall: true });
    const N = await s.device({ seed: F.awsMid, se: true, motion: true });
    await N.open();
    await s.expect("375px (the narrowest phone we draw): nothing overflows", () => noHScroll(N.page), true);
    await s.expect("the header's sub-line gives way with an ellipsis rather than wrapping: the station name is clipped, the next-rank text stays whole", async () => N.page.locator(".xp-sub").evaluate((e) => { const stn = e.querySelector(".xp-stn"); return { clip: getComputedStyle(stn).textOverflow, nowrap: getComputedStyle(stn).whiteSpace, oneLine: e.getBoundingClientRect().height < 20 }; }), { clip: "ellipsis", nowrap: "nowrap", oneLine: true });
    await s.pin("the narrow header", { hdr: await N.rect("header.hdr"), rank: await N.rect(".rank-name"), stn: await N.rect(".xp-stn") });
    await N.shot("shell-se");
    await N.setDark(true);
    await N.shot("shell-se");
    finish(s);
  });

  /* 15 ----------------------------------------------------------------- */
  scenario("15-phone-metro-dojo", "the phone: the Metro board, a card, the result, and the Dojo, in both palettes", async (s) => {
    const P = await s.device({ seed: F.board, phone: true, motion: true });
    await P.open();
    await P.tab("Metro");
    const page = P.page;
    const both = async (name, o = {}) => {
      await P.shot(name, o);
      await P.setDark(true);
      await P.shot(name, o);
      await P.setDark(false);
    };

    // ---- the board
    await s.expect("the board on a phone is the desktop's model, with no overflow", async () => ({ board: await board(page), over: await noHScroll(page) }), { board: boardModel(F.board, "mix"), over: true });
    await s.expect("the Metro tab is just taller than the window on a phone (the footnote sits under the tab bar's top edge): a few pixels to scroll", async () => page.evaluate(() => document.documentElement.scrollHeight >= innerHeight), true);
    await s.marked(P, "the board", "#quizArea");
    await both("board");
    await chooseDeck(P, "redo");
    await both("board-redemption");
    await chooseDeck(P, "dp");

    // ---- a card
    await boardIt(P, 101);
    const pre = await card(page);
    const q = cardOf(pre);
    await s.expect("the card on a phone: nothing overflows; every option is as wide as the card", async () => ({ over: await noHScroll(page), fit: await page.locator("#quizArea .opt").evaluateAll((els) => els.every((e) => { const c = e.closest(".qwrap").getBoundingClientRect(); const r = e.getBoundingClientRect(); return r.left >= c.left && r.right <= c.right; })) }), { over: true, fit: true });
    await both("card");
    const rightSlot = pre.opts.findIndex((o) => o.text === q.o[q.a]);
    await P.press(page.locator("#quizArea .opt").nth(rightSlot));
    await both("card-right");
    await P.press(nextBtn(page));
    const pre2 = await card(page);
    const q2 = cardOf(pre2);
    const right2 = pre2.opts.findIndex((o) => o.text === q2.o[q2.a]);
    await P.press(page.locator("#quizArea .opt").nth([0, 1, 2, 3].find((k) => k !== right2)));
    await both("card-wrong");

    // ---- a card with code, answered
    await P.press(quitBtn(page));
    await chooseDeck(P, "graphs");
    await boardIt(P, 102);
    let codeCard = null;
    for (let i = 0; i < 10 && !codeCard; i++) {
      const c = await card(page);
      if (c.code) codeCard = c;
      else {
        const qq = cardOf(c);
        await P.press(page.locator("#quizArea .opt").nth(c.opts.findIndex((o) => o.text === qq.o[qq.a])));
        await nextStop(P);
      }
    }
    await s.expect("a missing-line or bug-hunt card shows its code in a scrollable mono block inside the card", async () => ({ has: !!codeCard, scroll: (await P.props("#quizArea pre.code", ["overflow-x", "white-space", "font-size"])) }), { has: true, scroll: { "overflow-x": "auto", "white-space": "pre", "font-size": "12px" } });
    await both("card-code");
    await P.press(quitBtn(page));

    // ---- the result
    await boardIt(P, 103);
    await rush(P, "RRWRRRRWRR", { seedBase: 300 });
    await P.press(nextBtn(page));
    await s.expect("the result on a phone: 8/10, the Solid copy, three columns of numbers inside the card", async () => ({ res: await result(page), over: await noHScroll(page) }), { res: { cls: "qwrap result", big: "8/10", sub: "Solid. The missed ones went to Redemption.", row: ["+20|XP", "4|best streak", "2|to redemption"], btns: ["Run it again", "Decks"] }, over: true });
    await both("result");

    // ---- the Dojo
    await P.tab("Dojo");
    await s.expect("the Dojo on a phone: no overflow", () => noHScroll(page), true);
    await both("dojo", { tall: true });
    await page.locator("#dojoArea .tcard").first().locator(".thead").tap();
    await both("dojo-open");
    await page.locator("#dojoArea .tcard").first().locator(".veil button").tap();
    await s.expect("a revealed template's code scrolls sideways inside its block, not the page", async () => ({ over: await noHScroll(page), pre: (await P.props("#dojoArea .tcard.open pre.code", ["overflow-x"]))["overflow-x"] }), { over: true, pre: "auto" });
    await both("dojo-revealed");
    finish(s);
  });
}

async function nextStop(P) {
  await P.press(P.page.locator("#quizArea .qnav .next"));
}
