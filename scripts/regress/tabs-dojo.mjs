// Rituals, shared between the Line's ritual row and the Dojo's log (07), and the Dojo: templates grouped, the blur
// veil and the session-only reveal, the ritual log (11).

import { finish } from "./me-lib.mjs";
import { D, F, edit, hdr, hdrModel, ritualAt, feedOf, shape, planOf, focusOf } from "./tabs-kit.mjs";
import { TODAY } from "./tabs-fixtures.mjs";
import { stn, RGB } from "./tabs-line.mjs";

const heroDojo = (page) => page.locator("main .hero").evaluate((h) => ({ h1: h.querySelector("h1").textContent, p: h.querySelector("p").textContent }));

/** The Dojo's page in order: the ritual log (or the Local's note), then labels and template cards. */
const layout = (page) =>
  page.locator("#dojoArea").evaluate((a) =>
    [...a.children].map((e) => (e.classList.contains("sectionlabel") ? "label:" + e.textContent : e.classList.contains("tcard") ? "card:" + e.querySelector("h3").textContent : e.className))
  );

const layoutModel = (blob) => {
  const first = focusOf(blob).ritual ? "dojo-log" + (blob.tracks[blob.track].rituals[focusOf(blob).id] ? " logged" : "") : "dojo-local";
  const out = [first];
  let group = "";
  for (const t of D.TPL) {
    if (t.g !== group) out.push("label:" + t.g);
    group = t.g;
    out.push("card:" + t.n);
  }
  return out;
};

const log = (page) =>
  page.locator("#dojoArea .dojo-log").evaluate((l) => ({
    cls: l.className,
    b: l.querySelector("p b").textContent,
    p: l.querySelector("p").textContent,
    btn: l.querySelector("button").textContent.trim(),
    pressed: l.querySelector("button").getAttribute("aria-pressed"),
    glyph: window.__glyph(l.querySelector("button svg")),
    dot: !!l.querySelector("button .bdot"),
  }));

const cards = (page) =>
  page.locator("#dojoArea .tcard").evaluateAll((els) =>
    els.map((c) => ({
      cls: c.className,
      h3: c.querySelector("h3").textContent,
      tag: c.querySelector(".ttag").textContent,
      expanded: c.querySelector(".thead").getAttribute("aria-expanded"),
      hidden: c.querySelector(".tcode").classList.contains("hidden"),
    }))
  );

const cardModel = (open, shown) =>
  D.TPL.map((t) => ({ cls: "tcard" + (open.includes(t.id) ? " open" : ""), h3: t.n, tag: t.tag, expanded: String(open.includes(t.id)), hidden: !shown.includes(t.id) }));

const tcard = (page, id) => page.locator("#dojoArea .tcard").nth(D.TPL.findIndex((t) => t.id === id));

export default function register(scenario) {
  /* 7 ------------------------------------------------------------------ */
  scenario("07-rituals", "the morning ritual: the Line's row and the Dojo's log are one switch: +15 XP once, a silent refund, Template Monk at five", async (s) => {
    const A = await s.device({ seed: F.ritual4, motion: true });
    await A.open();
    await A.pause();
    const page = A.page;
    const d5 = planOf("google")[4];
    let blob = F.ritual4;
    const agree = async (label) => {
      await s.expect(`${label}: the header follows the saved blob`, async () => hdr(page), hdrModel(blob));
      await s.expect(`${label}: what is saved is that blob`, async () => shape(await A.saved()), shape(blob));
    };

    // ---- the rows
    await s.expect("every station of the Google line has a ritual row, with its own text and +15", () => page.locator(".linewrap .ritual").evaluateAll((els) => els.map((e) => e.children[1].textContent + "|" + e.querySelector(".xpv").textContent)), planOf("google").map((d) => d.ritual + "|+15"));
    await s.expect("day 5 is the focus day (days 1-4 done, four rituals logged): its row is undone", () => ritualAt(page, 4), { cls: "ritual", pressed: "false", text: d5.ritual, xp: "+15", fill: "", tick: "check" });
    await s.expect("the Dojo's log is the same day's, undone: 'Day 5 ritual:' and the ritual, a Done button with +15 XP", async () => (await A.tab("Dojo"), await log(page)), { cls: "dojo-log", b: "Day 5 ritual:", p: "Day 5 ritual: " + d5.ritual, btn: "Done+15 XP", pressed: "false", glyph: null, dot: true });
    await A.tab("Line");

    // ---- the fifth ritual, from the Line
    await A.clearFx();
    await page.locator(".linewrap > .stn").nth(4).locator(".ritual").click();
    blob = edit(blob, (b) => {
      b.tracks.google.rituals[d5.id] = TODAY;
      b.tracks.google.xp += 15;
      b.badges.ritual5 = 1;
    });
    await s.expect("logging the fifth ritual: the XP toast, then the Template Monk badge (gold); no confetti for a ritual", async () => feedOf(await A.fx()), ["+15 XP · ritual", "* Badge — Template Monk"]);
    await s.expect("…the row is done: solid outline, the check filled in the station's green", () => ritualAt(page, 4), { cls: "ritual done", pressed: "true", text: d5.ritual, xp: "+15", fill: "var(--green)", tick: "check" });
    await agree("after logging on the Line");
    await s.expect("the done row has a solid outline in the station's colour and a tinted ground; the check circle is 22px", async () => ({ p: await A.props(stn(page, 4).locator(".ritual"), ["border-top-style", "border-top-color"]), c: await A.props(stn(page, 4).locator(".ritual .pcheck"), ["width", "height", "background-color", "color"]) }), { p: { "border-top-style": "solid", "border-top-color": RGB.green }, c: { width: "22px", height: "22px", "background-color": RGB.green, color: "rgb(255, 255, 255)" } });
    await s.pin("the done ritual's tint", (await A.props(stn(page, 4).locator(".ritual"), ["background-color"]))["background-color"]);

    // ---- the Dojo sees it
    await A.tab("Dojo");
    await s.expect("in the Dojo the same ritual reads Logged with a check, and the log is solid", () => log(page), { cls: "dojo-log logged", b: "Day 5 ritual:", p: "Day 5 ritual: " + d5.ritual, btn: "Logged", pressed: "true", glyph: "check", dot: false });
    await A.clearFx();
    await page.locator("#dojoArea .dojo-log button").click();
    blob = edit(blob, (b) => {
      delete b.tracks.google.rituals[d5.id];
      b.tracks.google.xp -= 15;
    });
    await A.advance(300);
    await A.settle();
    await s.expect("pressing Logged in the Dojo undoes it silently: the +15 comes back off, the badge stays", async () => ({ fx: await A.fx(), log: await log(page) }), { fx: [], log: { cls: "dojo-log", b: "Day 5 ritual:", p: "Day 5 ritual: " + d5.ritual, btn: "Done+15 XP", pressed: "false", glyph: null, dot: true } });
    await agree("after undoing in the Dojo");
    await s.expect("…the badge Template Monk is still there", async () => !!(await A.blob()).badges.ritual5, true);
    await A.tab("Line");
    await s.expect("…and the Line's row is undone again", () => ritualAt(page, 4), { cls: "ritual", pressed: "false", text: d5.ritual, xp: "+15", fill: "", tick: "check" });

    // ---- logging from the Dojo
    await A.tab("Dojo");
    await A.clearFx();
    await page.locator("#dojoArea .dojo-log button").click();
    blob = edit(blob, (b) => {
      b.tracks.google.rituals[d5.id] = TODAY;
      b.tracks.google.xp += 15;
    });
    await s.expect("logging from the Dojo: the XP toast only (Template Monk is announced once)", async () => feedOf(await A.fx()), ["+15 XP · ritual"]);
    await agree("after logging in the Dojo");
    await A.tab("Line");
    await s.expect("…and the Line's row is done", async () => (await ritualAt(page, 4)).cls, "ritual done");
    await A.clearFx();
    await page.locator(".linewrap > .stn").nth(4).locator(".ritual").click();
    blob = edit(blob, (b) => {
      delete b.tracks.google.rituals[d5.id];
      b.tracks.google.xp -= 15;
    });
    await A.advance(300);
    await A.settle();
    await s.expect("pressing the done row on the Line undoes it silently", async () => ({ fx: await A.fx(), row: (await ritualAt(page, 4)).cls }), { fx: [], row: "ritual" });
    await agree("after undoing on the Line");

    // ---- a ritual that climbs a rank
    const R = await s.device({ seed: edit(F.midQuiet, (b) => { b.tracks.google.xp = 240; }), motion: true });
    await R.open();
    await R.clearFx();
    await R.page.locator(".linewrap > .stn").nth(2).locator(".ritual").click();
    await s.expect("a ritual that takes 240 XP to 255: the XP toast, the rank-up and its burst of 60", async () => feedOf(await R.fx()), ["+15 XP · ritual", "* Rank up — Backtracker", "confetti 60"]);

    // ---- the Local has none
    const L = await s.device({ seed: F.awsMid, motion: true });
    await L.open();
    await L.tab("Dojo");
    await s.expect("on the Local the Dojo explains there are no rituals and shows no log", async () => ({ log: await L.page.locator(".dojo-log").count(), note: await L.page.locator(".dojo-local").textContent() }), { log: 0, note: "No morning rituals on the Local — but the templates below are fair game whenever a stop leans on one." });
    finish(s);
  });

  /* 11 ----------------------------------------------------------------- */
  scenario("11-dojo", "the Dojo: templates in three groups, open and closed, the blur veil and the session-only reveal, the ritual log, the Local's note", async (s) => {
    const A = await s.device({ seed: F.mid, motion: true });
    await A.open();
    await A.tab("Dojo");
    const page = A.page;
    const t1 = D.TPL[0];

    // ---- the page
    await s.expect("the hero: The dojo, and what the ritual is", () => heroDojo(page), { h1: "The dojo", p: "The daily ritual: write the day's template from a blank page, from memory. Then reveal and diff — the gap is the lesson." });
    await s.expect("the ritual log first, then the templates in three groups: This week's spine (7), Graph recall (6), Structures (2)", () => layout(page), layoutModel(F.mid));
    await s.expect("…15 templates, 3 labels", async () => ({ cards: await page.locator("#dojoArea .tcard").count(), labels: await page.locator("#dojoArea .sectionlabel").allTextContents() }), { cards: 15, labels: ["This week's spine", "Graph recall", "Structures"] });
    await s.expect("every card starts closed with its code behind the blur", () => cards(page), cardModel([], []));
    await s.expect("a closed card shows its name and its tag chip (Day 1, unweighted, …) and nothing of its body", async () => ({ head: await page.locator("#dojoArea .thead").first().evaluate((h) => h.textContent), body: (await A.props(tcard(page, "t1").locator(".tbody"), ["display"])).display }), { head: "Root-to-leaf paths (DFS)Day 1", body: "none" });
    await s.expect("the ritual log: day 3's ritual, a yellow dashed outline, a Done +15 XP button", async () => ({ log: await log(page), look: await A.props("#dojoArea .dojo-log", ["border-top-style", "border-top-color", "border-top-width"]) }), {
      log: { cls: "dojo-log", b: "Day 3 ritual:", p: "Day 3 ritual: " + planOf("google")[2].ritual, btn: "Done+15 XP", pressed: "false", glyph: null, dot: true },
      look: { "border-top-style": "dashed", "border-top-color": RGB.yellow, "border-top-width": "1px" },
    });
    await s.expect("the Done button is a yellow pill with dark ink", () => A.props("#dojoArea .dojo-log button", ["background-color", "color", "font-weight", "border-top-left-radius"]), { "background-color": RGB.yellow, color: RGB.ink, "font-weight": "700", "border-top-left-radius": "999px" });
    await s.marked(A, "the Dojo (#dojoArea)", "#dojoArea");
    await A.shot("dojo", { tall: true });
    await A.setDark(true);
    await A.shot("dojo", { tall: true });
    await A.setDark(false);

    // ---- opening cards
    await tcard(page, "t1").locator(".thead").click();
    await s.expect("pressing a template opens it: aria-expanded, the .open class, the body and a turned chevron", async () => ({ card: (await cards(page))[0], body: (await A.props(tcard(page, "t1").locator(".tbody"), ["display"])).display, chev: (await A.props(tcard(page, "t1").locator(".chev"), ["transform"])).transform }), { card: cardModel(["t1"], [])[0], body: "block", chev: "matrix(-1, 0, 0, -1, 0, 0)" });
    await s.expect("the body has the note and the code, word for word", async () => ({ note: await tcard(page, "t1").locator(".tnote").textContent(), code: await tcard(page, "t1").locator("pre.code").evaluate((p) => p.textContent), blanks: await tcard(page, "t1").locator("pre.code .blank").count() }), { note: t1.note, code: t1.code, blanks: t1.code.split("____").length - 1 });
    await s.expect("the code is blurred (7px) and cannot be selected; the veil sits over it with a lock, 'Write yours from a blank page first.' and a Reveal & diff button", async () => ({
      pre: await A.props(tcard(page, "t1").locator("pre.code"), ["filter", "user-select"]),
      veil: await tcard(page, "t1").locator(".veil").evaluate((v) => ({ text: v.querySelector("span").textContent, btn: v.querySelector("button").textContent, glyph: window.__glyph(v.querySelector("svg")), pos: getComputedStyle(v).position, display: getComputedStyle(v).display })),
    }), { pre: { filter: "blur(7px)", "user-select": "none" }, veil: { text: "Write yours from a blank page first.", btn: "Reveal & diff", glyph: "lock", pos: "absolute", display: "flex" } });
    await tcard(page, "t8").locator(".thead").click();
    await tcard(page, "t14").locator(".thead").click();
    await s.expect("cards are independent: three can be open at once", async () => (await cards(page)).filter((c) => c.expanded === "true").map((c) => c.h3), [D.TPL[0].n, D.TPL[7].n, D.TPL[13].n]);
    await s.pin("the open card's frame", { head: await A.props(tcard(page, "t1").locator(".thead"), ["padding-top", "padding-left", "gap"]), body: await A.props(tcard(page, "t1").locator(".tbody"), ["padding-top", "border-top-width"]), note: await A.props(tcard(page, "t1").locator(".tnote"), ["font-size", "color"]), pre: await A.props(tcard(page, "t1").locator("pre.code"), ["font-size", "line-height", "tab-size", "border-top-left-radius"]) });
    await tcard(page, "t1").scrollIntoViewIfNeeded();
    await A.scrollTo(0);
    await A.shot("dojo-open", { tall: true });
    await A.setDark(true);
    await A.shot("dojo-open", { tall: true });
    await A.setDark(false);

    // ---- the reveal
    await tcard(page, "t1").locator(".veil button").click();
    await s.expect("Reveal & diff un-blurs that card only: its veil goes, the code is plain, selectable; the other open cards keep theirs; it stays open", async () => ({
      cards: (await cards(page)).filter((c) => c.expanded === "true").map((c) => [c.h3, c.hidden]),
      pre: await A.props(tcard(page, "t1").locator("pre.code"), ["filter", "user-select"]),
      veil: (await A.props(tcard(page, "t1").locator(".veil"), ["display"])).display,
      other: (await A.props(tcard(page, "t8").locator("pre.code"), ["filter"])).filter,
    }), { cards: [[D.TPL[0].n, false], [D.TPL[7].n, true], [D.TPL[13].n, true]], pre: { filter: "none", "user-select": "auto" }, veil: "none", other: "blur(7px)" });
    await tcard(page, "t1").locator(".thead").click();
    await tcard(page, "t1").locator(".thead").click();
    await s.expect("closing and reopening a revealed card keeps it revealed", async () => (await cards(page))[0], cardModel(["t1", "t8", "t14"], ["t1"])[0]);
    await A.tab("Line");
    await A.tab("Dojo");
    await s.expect("a trip to another tab keeps what is open and what is revealed", () => cards(page), cardModel(["t1", "t8", "t14"], ["t1"]));
    await s.expect("the reveal is not saved: the progress blob has nothing about templates", async () => Object.keys(await A.saved()).sort(), ["badges", "quiz", "streak", "track", "tracks", "v"]);
    await A.shot("dojo-revealed", { tall: true });
    await A.setDark(true);
    await A.shot("dojo-revealed", { tall: true });
    await A.setDark(false);
    await A.reload();
    await A.tab("Dojo");
    await s.expect("after a reload every card is closed and blurred again (a reveal lasts a session, on purpose)", () => cards(page), cardModel([], []));

    // ---- the ritual log
    await A.clearFx();
    await page.locator("#dojoArea .dojo-log button").click();
    await s.expect("logging the ritual adds +15 XP · ritual and carries the streak to 3 (Heating Up), no confetti; the log reads Logged with a check and goes solid", async () => ({ feed: feedOf(await A.fx()), log: await log(page) }), { feed: ["+15 XP · ritual", "* Badge — Heating Up"], log: { cls: "dojo-log logged", b: "Day 3 ritual:", p: "Day 3 ritual: " + planOf("google")[2].ritual, btn: "Logged", pressed: "true", glyph: "check", dot: false } });
    await s.expect("a logged log is solid-outlined with a quiet grey button", () => A.props("#dojoArea .dojo-log button", ["background-color", "color"]), { "background-color": "rgb(241, 243, 244)", color: RGB.ink2 });
    await s.expect("the header took the 15 XP (200 to 215)", async () => (await hdr(page)).xp, "215");
    await A.shot("dojo-logged");
    await A.setDark(true);
    await A.shot("dojo-logged");
    await A.setDark(false);

    // ---- once the focus day moves on, the log is the next day's
    const N = await s.device({ seed: F.nearClear, motion: true });
    await N.open();
    await N.page.getByRole("button", { name: "Check Top K Frequent Elements", exact: true }).click();
    await N.tab("Dojo");
    await s.expect("clearing day 3 moves the Dojo's log on to day 4's ritual, not yet logged", async () => (await log(N.page)).p, "Day 4 ritual: " + planOf("google")[3].ritual);

    // ---- the whole line ridden: the last day's ritual stays
    const E = await s.device({ seed: F.lineDone, motion: true });
    await E.open();
    await E.tab("Dojo");
    await s.expect("with the whole line ridden the log stays on the last day (Day 24), logged", async () => ({ p: (await log(E.page)).p, cls: (await log(E.page)).cls }), { p: "Day 24 ritual: " + planOf("google")[23].ritual, cls: "dojo-log logged" });

    // ---- the Local
    const L = await s.device({ seed: F.awsMid, motion: true });
    await L.open();
    await L.tab("Dojo");
    await s.expect("on the Local: no ritual log, a dashed note instead, and all 15 templates still there", () => layout(L.page), layoutModel(F.awsMid));
    await s.expect("…the note says so", () => L.page.locator(".dojo-local").textContent(), "No morning rituals on the Local — but the templates below are fair game whenever a stop leans on one.");
    await s.expect("…and it is a dashed grey box", () => L.props(".dojo-local", ["border-top-style", "border-top-color", "font-size", "color"]), { "border-top-style": "dashed", "border-top-color": RGB.line, "font-size": "13px", color: RGB.ink2 });
    await L.shot("dojo-local");
    await L.setDark(true);
    await L.shot("dojo-local");
    finish(s);
  });
}
