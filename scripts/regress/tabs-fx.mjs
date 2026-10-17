// The celebrations (12): toast stacking and the exact moments they leave (3 s; the CSS fade starts at 2.5 s), confetti
// pieces and their removal (2.8 s), the ids the store stamps, reduced motion (toasts yes, confetti no), and the
// stacking order of everything that floats (header 30, tabs 40, workspace 50, confetti 55, overlays 58, toasts 60).

import { finish } from "./me-lib.mjs";
import { F, feedOf, probById, consecutive } from "./tabs-kit.mjs";

const byKey = (fx) => [...fx].sort((a, b) => Number(a.key) - Number(b.key));
import { stn, RGB } from "./tabs-line.mjs";

/* What the picture is about: toasts show, confetti stays out of the frame. */
const SHOW_TOASTS = ".confetti, .cf { visibility: hidden !important; }";

const pcheck = (page, name, checked = false) => page.getByRole("button", { name: (checked ? "Uncheck " : "Check ") + name, exact: true });
const ritualBtn = (page) => stn(page, 2).locator(".ritual");

const toastGeometry = (page) =>
  page.locator(".toasts .toast").evaluateAll((els) => {
    const w = document.documentElement.clientWidth;
    const rs = els.map((e) => e.getBoundingClientRect());
    return {
      n: els.length,
      top: rs[0] && rs[0].top,
      gaps: rs.slice(1).map((r, i) => Math.round((r.top - rs[i].bottom) * 100) / 100),
      centred: rs.every((r) => Math.abs(r.left + r.width / 2 - w / 2) < 0.6),
      narrow: rs.every((r) => r.width <= Math.min(0.92 * innerWidth, 420) + 0.01),
    };
  });

export default function register(scenario) {
  scenario("12-celebrations", "toasts and confetti: stacking, the 3 s and 2.8 s lifetimes, ids, confetti pieces, reduced motion, what floats above what", async (s) => {
    // ================= timing, with motion on and the clock held
    const A = await s.device({ seed: F.midQuiet, motion: true });
    await A.open();
    await A.pause();
    const page = A.page;
    const tkf = "Top K Frequent Elements";

    await A.seed(5);
    await ritualBtn(page).click();
    await s.expect("a ritual raises one toast and nothing else", async () => feedOf(await A.fx()), ["+15 XP · ritual"]);
    await A.advance(1500);
    const before = (await A.fx()).length;
    const drawsBefore = await A.draws();
    await A.seed(6);
    await pcheck(page, tkf).click();
    await s.expect("1.5 s later a check raises a second toast and a burst of 12: three celebrations altogether, ids rising in the order raised", async () => {
      const fx = await A.fx();
      return { feed: feedOf(fx), keys: consecutive(byKey(fx)) };
    }, { feed: ["+15 XP · ritual", "+20 XP · Top K Frequent Elements", "confetti 12"], keys: true });
    await s.expect("the two toasts are stacked in the order they came, with the burst beside them", () => A.live(), { toasts: ["+15 XP · ritual", "+20 XP · Top K Frequent Elements"], bursts: [12] });
    await s.expect("a burst of 12 pieces draws 36 random numbers (a column, a fall time and a delay each), once", async () => (await A.draws()) - drawsBefore - 0, 36);

    await A.advance(1499);
    await s.expect("at 2.999 s the first toast is still up", async () => (await A.live()).toasts, ["+15 XP · ritual", "+20 XP · Top K Frequent Elements"]);
    await A.advance(1);
    await s.expect("at 3.000 s the first toast leaves; the second (1.5 s younger) and the burst stay", () => A.live(), { toasts: ["+20 XP · Top K Frequent Elements"], bursts: [12] });
    await A.advance(1299);
    await s.expect("at 4.299 s the burst (2.8 s old at 4.3) is still falling", async () => (await A.live()).bursts, [12]);
    await A.advance(1);
    await s.expect("at 4.300 s the burst is removed, 2.8 s after it began; the second toast remains", () => A.live(), { toasts: ["+20 XP · Top K Frequent Elements"], bursts: [] });
    await A.advance(199);
    await s.expect("at 4.499 s the second toast is still up", async () => (await A.live()).toasts, ["+20 XP · Top K Frequent Elements"]);
    await A.advance(1);
    await s.expect("at 4.500 s it leaves, 3 s after it came: the page holds no toast and no confetti", () => A.live(), { toasts: [], bursts: [] });
    await s.expect("lifetimes as recorded, in the order the ids were stamped: each toast 3000 ms, the burst 2800 ms", async () => byKey(await A.fx()).map((e) => `${e.kind} ${e.gone - e.at}`), ["toast 3000", "toast 3000", "confetti 2800"]);

    // ---- the CSS side of the clock: the fade starts at 2.5 s, 0.5 s before the toast leaves
    await A.seed(7);
    await pcheck(page, tkf, true).click();
    await pcheck(page, tkf).click();
    await s.expect("a toast's animation is a 0.25 s slide-in followed by a 0.3 s fade-out that starts 2.5 s in and holds its last frame (tin, tout)", async () => A.page.locator(".toast").last().evaluate((e) => {
      const cs = getComputedStyle(e);
      return { name: cs.animationName, dur: cs.animationDuration, delay: cs.animationDelay, fill: cs.animationFillMode, count: cs.animationIterationCount };
    }), { name: "tin, tout", dur: "0.25s, 0.3s", delay: "0s, 2.5s", fill: "none, forwards", count: "1, 1" });
    await s.pin("the toast's two easings", await page.locator(".toast").last().evaluate((e) => getComputedStyle(e).animationTimingFunction));
    await s.expect("a confetti piece falls once, linearly, and stays where it lands", async () => page.locator(".cf").first().evaluate((e) => {
      const cs = getComputedStyle(e);
      return { name: cs.animationName, timing: cs.animationTimingFunction, fill: cs.animationFillMode, count: cs.animationIterationCount };
    }), { name: "fall", timing: "linear", fill: "forwards", count: "1" });
    await A.advance(3000);

    // ---- confetti pieces, seeded
    await A.seed(5);
    const d0 = await A.draws();
    await pcheck(page, tkf, true).click();
    await A.advance(10);
    await pcheck(page, tkf).click();
    await s.expect("a burst of 12: a fixed-position, click-through, aria-hidden layer under the toasts, clipped to the window", async () => A.page.locator(".confetti").last().evaluate((b) => {
      const cs = getComputedStyle(b);
      return { pos: cs.position, inset: cs.inset, z: cs.zIndex, events: cs.pointerEvents, overflow: cs.overflowX, hidden: b.getAttribute("aria-hidden"), pieces: b.querySelectorAll(".cf").length };
    }), { pos: "fixed", inset: "0px", z: "55", events: "none", overflow: "hidden", hidden: "true", pieces: 12 });
    const pieces = await page.locator(".confetti").last().locator(".cf").evaluateAll((els) => els.map((e) => ({ left: e.style.left, dur: e.style.animationDuration, delay: e.style.animationDelay, bg: getComputedStyle(e).backgroundColor })));
    await s.expect("the pieces take the four logo colours in turn, blue, red, yellow, green", async () => pieces.map((p) => p.bg), [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3].map((k) => [RGB.blue, RGB.red, RGB.yellow, RGB.green][k]));
    await s.expect("every piece starts within the window's width and falls for 0.9 to 2.1 s after a delay of up to 0.3 s", async () => pieces.every((p) => parseFloat(p.left) >= 0 && parseFloat(p.left) < 100 && p.left.endsWith("vw") && parseFloat(p.dur) >= 0.9 && parseFloat(p.dur) < 2.1 && parseFloat(p.delay) >= 0 && parseFloat(p.delay) < 0.3), true);
    await s.pin("the twelve pieces of a seed-5 burst (column / fall / delay)", pieces.map((p) => `${p.left}/${p.dur}/${p.delay}`).join(" "));
    await s.expect("a piece is an 8 x 12 chip with a 2px radius, hung just above the window", async () => A.props(page.locator(".confetti").last().locator(".cf").first(), ["position", "top", "width", "height", "border-top-left-radius"]), { position: "absolute", top: "-12px", width: "8px", height: "12px", "border-top-left-radius": "2px" });
    const draws1 = await A.draws();
    await A.tab("Dojo");
    await A.tab("Line");
    await s.expect("the pieces are scattered once: a trip to another tab (a re-render) neither moves them nor draws another random number", async () => ({ same: JSON.stringify(await page.locator(".confetti").last().locator(".cf").evaluateAll((els) => els.map((e) => ({ left: e.style.left, dur: e.style.animationDuration, delay: e.style.animationDelay, bg: getComputedStyle(e).backgroundColor })))) === JSON.stringify(pieces), draws: (await A.draws()) === draws1 }), { same: true, draws: true });
    await A.advance(3000);

    // ---- ids: strictly increasing, unique, across everything this device has raised
    await s.expect("every celebration this page played got the next id, 1, 2, 3... with no gap and no repeat, though toasts left and tabs changed in between (so nothing was played twice, and nothing was skipped)", async () => byKey(await A.fx()).map((e) => Number(e.key)), [1, 2, 3, 4, 5, 6, 7]);
    await s.expect("…seven celebrations: a ritual (1) and three checks (toast and burst each); the undone ticks raised none", async () => (await A.fx()).length, 7);

    // ================= reduced motion
    const R = await s.device({ seed: F.mid, motion: false });
    await R.open();
    await R.pause();
    const rp = R.page;
    await R.clearFx();
    await pcheck(rp, "N-Queens").click();
    await s.expect("with reduced motion the toasts still come (the XP, the badge) but no confetti is made: not raised, not on the page", async () => ({ feed: feedOf(await R.fx()), live: await R.live(), layers: await rp.locator(".confetti").count() }), { feed: ["+40 XP · N-Queens", "* Badge — Heating Up"], live: { toasts: ["+40 XP · N-Queens", "* Badge — Heating Up"], bursts: [] }, layers: 0 });
    await s.expect("…and the toasts do not animate", async () => R.page.locator(".toast").first().evaluate((e) => ({ name: getComputedStyle(e).animationName, opacity: getComputedStyle(e).opacity, transform: getComputedStyle(e).transform })), { name: "none", opacity: "1", transform: "none" });
    await s.expect("the toast stack: the first 8px from the top, 6px between, centred, narrower than 92vw and 420px", () => toastGeometry(rp), { n: 2, top: 8, gaps: [6], centred: true, narrow: true });
    await s.expect("the stack is a polite live region, fixed across the top at level 60, and lets clicks through", async () => ({ aria: await rp.locator(".toasts").getAttribute("aria-live"), p: await R.props(".toasts", ["position", "z-index", "pointer-events", "display", "flex-direction", "align-items", "gap", "top", "left", "right"]) }), { aria: "polite", p: { position: "fixed", "z-index": "60", "pointer-events": "none", display: "flex", "flex-direction": "column", "align-items": "center", gap: "6px", top: "8px", left: "0px", right: "0px" } });
    await s.expect("a plain toast is ink with page-coloured 13px medium text in a pill; a gold one is yellow with dark semibold text", async () => ({
      plain: await R.props(rp.locator(".toast:not(.gold)"), ["background-color", "color", "font-size", "font-weight", "padding-top", "padding-left", "border-top-left-radius", "text-align", "letter-spacing"]),
      gold: await R.props(rp.locator(".toast.gold"), ["background-color", "color", "font-weight"]),
    }), {
      plain: { "background-color": RGB.ink, color: "rgb(248, 249, 250)", "font-size": "13px", "font-weight": "500", "padding-top": "10px", "padding-left": "18px", "border-top-left-radius": "999px", "text-align": "center", "letter-spacing": "0.13px" },
      gold: { "background-color": RGB.yellow, color: RGB.ink, "font-weight": "600" },
    });
    await s.pin("the toasts' shadows", { plain: (await R.props(rp.locator(".toast:not(.gold)"), ["box-shadow"]))["box-shadow"], gold: (await R.props(rp.locator(".toast.gold"), ["box-shadow"]))["box-shadow"] });
    await s.expect("toasts do not catch the pointer: the element at the middle of the first toast is the header's, not the toast's", async () => {
      const box = await rp.locator(".toast").first().boundingBox();
      return rp.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return { header: !!e.closest("header.hdr"), toast: !!e.closest(".toasts") }; }, [box.x + box.width / 2, box.y + box.height / 2]);
    }, { header: true, toast: false });
    await R.shot("toasts", { hide: SHOW_TOASTS });
    await R.setDark(true);
    await s.expect("in the dark palette the plain toast is light ink on the dark page colour, the gold one the softer yellow", async () => ({ plain: await R.props(rp.locator(".toast:not(.gold)"), ["background-color", "color"]), gold: await R.props(rp.locator(".toast.gold"), ["background-color", "color"]) }), { plain: { "background-color": "rgb(232, 234, 237)", color: "rgb(32, 33, 36)" }, gold: { "background-color": "rgb(253, 214, 99)", color: "rgb(32, 33, 36)" } });
    await R.shot("toasts", { hide: SHOW_TOASTS });
    await R.setDark(false);
    await R.advance(3000);
    await s.expect("the toasts leave at 3 s with reduced motion too", () => R.live(), { toasts: [], bursts: [] });

    // ---- the preference is read when a celebration is raised, not once at load
    await R.page.emulateMedia({ reducedMotion: "no-preference" });
    await R.clearFx();
    await pcheck(rp, "N-Queens", true).click();
    await pcheck(rp, "N-Queens").click();
    await s.expect("switch the preference off at run time and the next check throws confetti again (a burst of 12 comes with the toast)", async () => feedOf(await R.fx()), ["+40 XP · N-Queens", "confetti 12"]);
    await R.advance(3000);
    await R.page.emulateMedia({ reducedMotion: "reduce" });
    await R.clearFx();
    await pcheck(rp, "N-Queens", true).click();
    await pcheck(rp, "N-Queens").click();
    await s.expect("…and back on, it stops again", async () => feedOf(await R.fx()), ["+40 XP · N-Queens"]);

    // ---- the big moment: a stack of toasts, for the picture
    const E = await s.device({ seed: F.lineEnd, motion: false });
    await E.open();
    await E.pause();
    await E.clearFx();
    await pcheck(E.page, probById("google", "mock4").n).click();
    await s.expect("the end of the line stacks five toasts at the top, four of them gold, in the order they were raised", () => E.live(), { toasts: ["+30 XP · Timed mock — Google-tagg…", "* Rank up — Offer Letter", "* Badge — Noogler", "* Final Approach cleared", "* Badge — End of the Line"], bursts: [] });
    await s.expect("…five toasts: first at 8px, 6px between each", () => toastGeometry(E.page), { n: 5, top: 8, gaps: [6, 6, 6, 6], centred: true, narrow: true });
    await E.shot("toasts-five", { hide: SHOW_TOASTS });
    await E.setDark(true);
    await E.shot("toasts-five", { hide: SHOW_TOASTS });

    // ================= what floats above what
    const Z = await s.device({ seed: F.mock, motion: false });
    await Z.open();
    const zp = Z.page;
    const z = async (sel) => (await Z.props(sel, ["z-index"]))["z-index"];
    const rule = (sel) => zp.evaluate((q) => { for (const sheet of document.styleSheets) for (const r of sheet.cssRules) if (r.selectorText === q) return r.style.zIndex; return null; }, sel);
    await stn(zp, 6).locator(".timer").getByRole("button", { name: "Start", exact: true }).click();
    await stn(zp, 6).locator(".prow button.golink").first().click();
    await zp.locator('.ws[role="dialog"]').waitFor();
    await zp.getByRole("button", { name: "Back to the line" }).waitFor();
    await Z.pause();
    await Z.advance(1_500_000);
    await s.expect("the mock clock ran out while the workspace was open: the toast is up over it", () => Z.live(), { toasts: ["* ⏰ Pencils down."], bursts: [] });
    await s.expect("the stacking order, bottom to top: header 30, tab bar 40, workspace 50, confetti 55, the Me tab's scanner and link sheet 58, toasts 60", async () => ({
      header: await z("header.hdr"),
      tabs: await z("nav.tabs"),
      workspace: await z(".ws"),
      toasts: await z(".toasts"),
      confetti: await rule(".confetti"),
      scan: await rule(".scanwrap"),
      sheet: await rule(".qrscrim"),
      boot: await rule(".ws-boot"),
    }), { header: "30", tabs: "40", workspace: "50", toasts: "60", confetti: "55", scan: "58", sheet: "58", boot: "50" });
    await s.expect("the open workspace covers the header and the tab bar: the elements under their old places are the workspace's", async () => zp.evaluate(() => [document.elementFromPoint(640, 20), document.elementFromPoint(300, 840)].map((e) => !!e.closest(".ws"))), [true, true]);
    await Z.shot("toast-over-workspace", { locator: zp.locator(".toasts"), hide: SHOW_TOASTS });
    finish(s);
  });
}
