// The pointer's states (16), which no still picture of a resting page sees: what hovering and pressing do to the
// Line's, the Metro's and the Dojo's controls (the rules inside @media (hover: hover) and the :active rules).
// Each reading is recorded as a pin: a changed colour, shadow, filter or scale shows up between two runs; a few
// have the value written out.

import { finish } from "./me-lib.mjs";
import { F } from "./tabs-kit.mjs";
import { card, cardOf } from "./tabs-metro-kit.mjs";
import { stn, RGB } from "./tabs-line.mjs";
import { chooseDeck, boardIt, nextBtn, quitBtn, boardBtn, rowOf } from "./tabs-metro.mjs";

const centre = (loc) => loc.evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));

/** The computed `props` of `loc` while the pointer is over it (mode "hover") or pressed on it (mode "active"). */
async function under(A, loc, props, mode) {
  const page = A.page;
  await centre(loc);
  const box = await loc.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  if (mode === "active") await page.mouse.down();
  const v = await A.props(loc, props);
  await page.mouse.move(640, 3);
  if (mode === "active") await page.mouse.up();
  await A.finishAnimations();
  return v;
}

export default function register(scenario) {
  scenario("16-pointer-states", "what hovering and pressing do: the Line's, Metro's and Dojo's controls (desktop pointer)", async (s) => {
    const A = await s.device({ seed: F.mid, motion: true });
    await A.open();
    const page = A.page;
    const day = (k) => stn(page, k);

    // ---- the Line
    const lineStates = [
      ["a closed day's header", day(3).locator(".dayhead"), ["background-color"]],
      ["a problem row", day(2).locator(".prow").nth(2), ["background-color"]],
      ["a pending check circle", day(2).locator(".prow").nth(2).locator(".pcheck"), ["border-top-color", "color", "transform"]],
      ["a done check circle", day(2).locator(".prow").nth(0).locator(".pcheck"), ["border-top-color", "color", "transform"]],
      ["the editor button", day(2).locator(".prow").nth(2).locator(".golink"), ["background-color", "color", "transform"]],
      ["a pending ritual row", day(2).locator(".ritual"), ["background-color"]],
      ["the line pill that is off", page.locator(".linepick[data-track='aws']"), ["border-top-color", "transform"]],
      ["the line pill that is on", page.locator(".linepick[data-track='google']"), ["border-top-color", "transform"]],
    ];
    for (const [label, loc, props] of lineStates) {
      for (const mode of ["hover", "active"]) s.pin(`${label} under the pointer (${mode})`, await under(A, loc, props, mode));
    }
    await s.expect("hovering a row tints it like the sunken ground; hovering a pending circle darkens its ring and shows the tick faintly", async () => ({
      row: (await under(A, day(2).locator(".prow").nth(2), ["background-color"], "hover"))["background-color"],
      ring: (await under(A, day(2).locator(".prow").nth(2).locator(".pcheck"), ["border-top-color", "color"], "hover")),
    }), { row: "rgb(241, 243, 244)", ring: { "border-top-color": RGB.ink2, color: RGB.line } });
    await s.expect("pressing a check circle squeezes it to 92%, the editor button to 94%, the line pill to 98%", async () => ({
      circle: (await under(A, day(2).locator(".prow").nth(2).locator(".pcheck"), ["transform"], "active")).transform,
      link: (await under(A, day(2).locator(".prow").nth(2).locator(".golink"), ["transform"], "active")).transform,
      pill: (await under(A, page.locator(".linepick[data-track='aws']"), ["transform"], "active")).transform,
    }), { circle: "matrix(0.92, 0, 0, 0.92, 0, 0)", link: "matrix(0.94, 0, 0, 0.94, 0, 0)", pill: "matrix(0.98, 0, 0, 0.98, 0, 0)" });
    await s.expect("hovering the editor button deepens its tint; the arrow link of a mock goes to the grey ground and dark ink", async () => {
      await page.locator(".linewrap > .stn").nth(6).locator(".dayhead").click();
      return (await under(A, day(6).locator("a.golink"), ["color"], "hover")).color;
    }, RGB.ink);
    s.pin("the mock's arrow link on hover", await under(A, day(6).locator("a.golink"), ["background-color", "color"], "hover"));
    s.pin("the clock's buttons on hover and pressed", { hover: await under(A, day(6).locator(".timer .tbtn").first(), ["border-top-color"], "hover"), active: await under(A, day(6).locator(".timer .tbtn").first(), ["transform"], "active") });
    await s.expect("nothing was ticked by the pressing (every press was released off the control): day 3's rows are as seeded", async () => day(2).locator(".prow .pcheck").evaluateAll((els) => els.map((e) => e.getAttribute("aria-pressed"))), ["true", "true", "false", "false"]);

    // ---- the Dojo
    await A.tab("Dojo");
    await page.locator("#dojoArea .tcard").first().locator(".thead").click();
    const dojoStates = [
      ["a template header", page.locator("#dojoArea .tcard").nth(1).locator(".thead"), ["background-color"]],
      ["the reveal button", page.locator("#dojoArea .tcard").first().locator(".veil button"), ["box-shadow", "transform"]],
      ["the ritual log's button", page.locator("#dojoArea .dojo-log button"), ["box-shadow", "transform"]],
    ];
    for (const [label, loc, props] of dojoStates) {
      for (const mode of ["hover", "active"]) s.pin(`${label} under the pointer (${mode})`, await under(A, loc, props, mode));
    }
    await s.expect("pressing the reveal button and the log's button squeezes them to 97%", async () => ({
      veil: (await under(A, page.locator("#dojoArea .tcard").first().locator(".veil button"), ["transform"], "active")).transform,
      log: (await under(A, page.locator("#dojoArea .dojo-log button"), ["transform"], "active")).transform,
    }), { veil: "matrix(0.97, 0, 0, 0.97, 0, 0)", log: "matrix(0.97, 0, 0, 0.97, 0, 0)" });

    // ---- Metro
    const M = await s.device({ seed: F.redoOne, motion: true });
    await M.open();
    await M.tab("Metro");
    const mp = M.page;
    for (const [label, loc, props] of [
      ["an unchosen deck row", rowOf(mp, "graphs"), ["background-color"]],
      ["the Board button", boardBtn(mp), ["filter", "transform"]],
    ]) {
      for (const mode of ["hover", "active"]) s.pin(`${label} under the pointer (${mode})`, await under(M, loc, props, mode));
    }
    await s.expect("hovering the Board button brightens it by 6%; pressing it squeezes it to 98%", async () => ({
      hover: (await under(M, boardBtn(mp), ["filter"], "hover")).filter,
      active: (await under(M, boardBtn(mp), ["transform"], "active")).transform,
    }), { hover: "brightness(1.06)", active: "matrix(0.98, 0, 0, 0.98, 0, 0)" });
    await chooseDeck(M, "redo");
    await boardIt(M, 111);
    const pre = await card(mp);
    const q = cardOf(pre);
    const optStates = [["an option", mp.locator("#quizArea .opt").nth(0), ["background-color", "transform"]]];
    for (const [label, loc, props] of optStates) {
      for (const mode of ["hover", "active"]) s.pin(`${label} under the pointer (${mode})`, await under(M, loc, props, mode));
    }
    await s.expect("hovering an option tints it with the sunken ground; pressing squeezes it to 98%", async () => ({
      hover: (await under(M, mp.locator("#quizArea .opt").nth(0), ["background-color"], "hover"))["background-color"],
      active: (await under(M, mp.locator("#quizArea .opt").nth(0), ["transform"], "active")).transform,
    }), { hover: "rgb(241, 243, 244)", active: "matrix(0.98, 0, 0, 0.98, 0, 0)" });
    await M.press(mp.locator("#quizArea .opt").nth(pre.opts.findIndex((o) => o.text === q.o[q.a])));
    for (const [label, loc, props] of [
      ["End run", quitBtn(mp), ["color"]],
      ["Next stop (Finish)", nextBtn(mp), ["opacity", "transform"]],
    ]) {
      for (const mode of ["hover", "active"]) s.pin(`${label} under the pointer (${mode})`, await under(M, loc, props, mode));
    }
    await s.expect("hovering End run darkens its label to ink; hovering Finish fades it to 88%; pressing it squeezes it to 97%", async () => ({
      quit: (await under(M, quitBtn(mp), ["color"], "hover")).color,
      next: (await under(M, nextBtn(mp), ["opacity"], "hover")).opacity,
      pressed: (await under(M, nextBtn(mp), ["transform"], "active")).transform,
    }), { quit: RGB.ink, next: "0.88", pressed: "matrix(0.97, 0, 0, 0.97, 0, 0)" });
    await M.press(nextBtn(mp));
    for (const mode of ["hover", "active"]) s.pin(`a result button under the pointer (${mode})`, await under(M, mp.locator("#quizArea .mbtn").first(), ["background-color", "border-top-color", "transform"], mode));
    await s.expect("hovering a result button tints it; pressing squeezes it to 97%", async () => ({
      hover: (await under(M, mp.locator("#quizArea .mbtn").first(), ["background-color"], "hover"))["background-color"],
      active: (await under(M, mp.locator("#quizArea .mbtn").first(), ["transform"], "active")).transform,
    }), { hover: "rgb(241, 243, 244)", active: "matrix(0.97, 0, 0, 0.97, 0, 0)" });
    finish(s);
  });
}
