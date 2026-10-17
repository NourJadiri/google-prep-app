// The Metro tab: the departures board (08), a run from the first card to the last with its streak multiplier, reveals,
// XP and the stops track (09), and how a run ends: the result screen, a perfect run, the Redemption deck (10).
// Randomness is the page's seeded Math.random (tabs-lib.mjs); the right answer of a card is read from the quiz bank
// (tabs-data.mjs), never from the page.

import { finish } from "./me-lib.mjs";
import { D, F, hdr, feedOf } from "./tabs-kit.mjs";
import { board, boardModel, card, result, cardOf, multOf, askModel, revealModel, cardView, FRESH_NOTE, deckStat } from "./tabs-metro-kit.mjs";

const rowOf = (page, id) => page.locator("#quizArea .drow").nth(D.DECKS.findIndex((d) => d.id === id));
const boardBtn = (page) => page.locator("#quizArea button.board");
const nextBtn = (page) => page.locator("#quizArea .qnav .next");
const quitBtn = (page) => page.locator("#quizArea .qnav .quit");

/** Choose a deck on the board. */
const chooseDeck = (A, id) => A.press(rowOf(A.page, id));

/** Press Board with the random stream restarted at `seed`; resolves once a card or the empty-deck toast is up. */
async function boardIt(A, seed) {
  await A.seed(seed);
  await A.press(boardBtn(A.page));
}

/** The cards of a run, one by one, with the page checked against the models at every step. `plan` is a string of
 *  R (answer right) and W (answer wrong), one letter per card; the run has `n` cards (default: the plan's length).
 *  Stops after the last planned answer, with the card still showing its reveal. Returns what the run was. */
async function play(s, A, { label, plan, n = plan.length, shots = {} }) {
  const page = A.page;
  const st = { streak: 0, best: 0, xp: 0, results: [], right: 0 };
  const ids = [];
  const picks = [];
  for (let i = 0; i < plan.length; i++) {
    await s.expect(`${label}: card ${i + 1} is up`, async () => (await card(page)).meta[0], `-:${i + 1}/${n}`);
    const pre = await card(page);
    const q = cardOf(pre);
    ids.push(q.id);
    const rightSlot = pre.opts.findIndex((o) => o.text === q.o[q.a]);
    const wantRight = plan[i] === "R";
    const slot = wantRight ? rightSlot : [0, 1, 2, 3].find((k) => k !== rightSlot);
    picks.push({ slot, rightSlot });
    await s.expect(`${label}: card ${i + 1} (${q.t}) before the answer: its text, options A-D, a quiet explain, End run only, ${st.results.length} stops filled`, async () => cardView(await card(page)), askModel(q, pre, { i, n, streak: st.streak, xp: st.xp, results: st.results }));
    if (shots[i]?.markAsk) await s.marked(A, shots[i].markAsk, "#quizArea");
    if (shots[i]?.ask) await A.shot(shots[i].ask);
    await A.press(page.locator("#quizArea .opt").nth(slot));
    if (wantRight) {
      st.streak++;
      st.best = Math.max(st.best, st.streak);
      st.xp += 2 * multOf(st.streak);
      st.right++;
    } else st.streak = 0;
    st.results.push(wantRight);
    await s.expect(`${label}: card ${i + 1} answered ${wantRight ? "right" : "wrong"}: ${wantRight ? "the right option green, the rest dimmed" : "the picked option red, the right one green, the rest dimmed"}, the explanation, ${i + 1 >= n ? "Finish" : "Next stop"}`, async () => cardView(await card(page)), revealModel(q, pre, { i, n, streak: st.streak, xp: st.xp, results: st.results, slot, rightSlot }));
    if (shots[i]?.markReveal) await s.marked(A, shots[i].markReveal, "#quizArea");
    if (shots[i]?.reveal) await A.shot(shots[i].reveal);
    if (i + 1 < plan.length) {
      await A.seed(500 + i);
      await A.press(nextBtn(page));
    }
  }
  return { ids, st, picks };
}

/** Answer and advance without looking at every step: `plan` as in play(); stops after the last answer. */
async function rush(A, plan, { seedBase = 700 } = {}) {
  const page = A.page;
  const ids = [];
  for (let i = 0; i < plan.length; i++) {
    const pre = await card(page);
    const q = cardOf(pre);
    ids.push(q.id);
    const rightSlot = pre.opts.findIndex((o) => o.text === q.o[q.a]);
    const slot = plan[i] === "R" ? rightSlot : [0, 1, 2, 3].find((k) => k !== rightSlot);
    await A.press(page.locator("#quizArea .opt").nth(slot));
    await page.locator("#quizArea .opt.right").first().waitFor();
    if (i + 1 < plan.length) {
      await A.seed(seedBase + i);
      await A.press(nextBtn(page));
      await page.waitForFunction((k) => document.querySelector("#quizArea .qmeta span")?.textContent.startsWith(k + "/"), i + 2);
    }
  }
  return ids;
}

const ph = (id) => D.Q.find((q) => q.id === id).ph;
const countBy = (ids, f) => ids.filter(f).length;

export { rowOf, boardBtn, nextBtn, quitBtn, chooseDeck, boardIt, play, rush, ph, countBy };

export default function register(scenario) {
  /* 8 ------------------------------------------------------------------ */
  scenario("08-metro-board", "the departures board: deck rows, tags, the delayed Redemption deck, platform labels, roundels, the Board button, the footnote", async (s) => {
    const A = await s.device({ motion: true });
    await A.open();
    await A.tab("Metro");
    const page = A.page;
    let blob = F.fresh;

    // ---- a first visit
    await s.expect("the hero: Metro mode, and what it is for", () => heroLine0(page), { h1: "Metro mode", p: "Thumb-only drills for the commute or the plane. Ten stops per run, streaks multiply your XP. No keyboard, no excuses." });
    await s.expect("the board for a first visit: six decks (Mix, Graphs, Backtracking, DP, Heaps & tries, Redemption), Mix boarding, nothing ridden, Redemption closed", () => board(page), boardModel(blob, "mix"));
    await s.expect("…in words", async () => {
      const b = await board(page);
      return b.rows.map((r) => `${r.name} | ${r.sub} | ${r.tag.split(":").slice(0, 2).join(":")}${r.disabled ? " | closed" : ""}`);
    }, [
      `Mix | ${D.Q.length} cards · weakest first | dtag:NOW BOARDING`,
      `Graphs | ${D.Q.filter((q) => q.ph === "graphs").length} cards · not yet ridden | dplat:P2`,
      `Backtracking | ${D.Q.filter((q) => q.ph === "bt").length} cards · not yet ridden | dplat:P3`,
      `DP | ${D.Q.filter((q) => q.ph === "dp").length} cards · not yet ridden | dplat:P4`,
      `Heaps & tries | ${D.Q.filter((q) => q.ph === "ds").length} cards · not yet ridden | dplat:P5`,
      "Redemption | no misses yet — clean sheet | dplat:P6 | closed",
    ]);
    await s.expect("the Board button names the chosen deck and the stops; the footnote explains the multipliers", async () => ({ btn: (await board(page)).boardBtn, note: (await board(page)).note, glyph: await boardBtn(page).evaluate((b) => window.__glyph(b.querySelector("svg"))) }), { btn: "Board Mix — 10 stops", note: FRESH_NOTE, glyph: "train" });
    await s.expect("the roundels: Mix a four-colour wheel (conic), Graphs G blue, Backtracking B red, DP D yellow (dark letter), Heaps H green, Redemption R orange", async () => page.locator("#quizArea .rdl").evaluateAll((els) => els.map((e) => ({ t: e.textContent, bg: e.style.background || (getComputedStyle(e).backgroundImage.startsWith("conic-gradient") ? "conic" : ""), cls: e.className }))), [
      { t: "", bg: "conic", cls: "rdl mix" },
      { t: "G", bg: "var(--blue)", cls: "rdl" },
      { t: "B", bg: "var(--red)", cls: "rdl" },
      { t: "D", bg: "var(--yellow)", cls: "rdl onyellow" },
      { t: "H", bg: "var(--green)", cls: "rdl" },
      { t: "R", bg: "var(--med)", cls: "rdl" },
    ]);
    await s.expect("the DP roundel's letter is dark ink in either palette (yellow never darkens); the others' are white", async () => ({ dp: (await A.props(rowOf(page, "dp").locator(".rdl"), ["color"])).color, graphs: (await A.props(rowOf(page, "graphs").locator(".rdl"), ["color"])).color }), { dp: "rgb(32, 33, 36)", graphs: "rgb(255, 255, 255)" });
    await s.expect("a row is at least 60px tall (it clears the 44px thumb floor without an overlay); the roundel is a 28px disc", async () => ({ rows: await page.locator("#quizArea .drow").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height >= 60)), disc: await A.props(rowOf(page, "graphs").locator(".rdl"), ["width", "height", "border-top-left-radius"]) }), { rows: [true, true, true, true, true, true], disc: { width: "28px", height: "28px", "border-top-left-radius": "50%" } });
    await s.expect("Redemption is disabled at zero misses: dimmed to 40% and with no pointer", async () => ({ disabled: await rowOf(page, "redo").isDisabled(), p: await A.props(rowOf(page, "redo"), ["opacity", "cursor"]) }), { disabled: true, p: { opacity: "0.4", cursor: "default" } });
    await rowOf(page, "redo").click({ force: true, timeout: 1500 }).catch(() => {});
    await s.expect("…pressing it anyway changes nothing: Mix is still the deck", async () => (await board(page)).boardBtn, "Board Mix — 10 stops");
    await s.expect("the Metro tab is no taller than the window on a desktop (nothing to scroll)", () => page.evaluate(() => document.documentElement.scrollHeight <= innerHeight), true);
    await s.marked(A, "the board (#quizArea)", "#quizArea");
    await A.shot("board");
    await A.setDark(true);
    await A.shot("board");
    await A.setDark(false);

    // ---- choosing decks
    for (const id of ["graphs", "bt", "dp", "ds"]) {
      await chooseDeck(A, id);
      await s.expect(`choosing ${D.DECKS.find((d) => d.id === id).n}: its row says NOW BOARDING with a ringed roundel, Mix goes back to platform P1, the button names it`, () => board(page), boardModel(blob, id));
    }
    await chooseDeck(A, "dp");
    await s.expect("the chosen row is tinted (the sunken ground), the others are not", async () => ({ sel: (await A.props(rowOf(page, "dp"), ["background-color"]))["background-color"], other: (await A.props(rowOf(page, "bt"), ["background-color"]))["background-color"] }), { sel: "rgb(241, 243, 244)", other: "rgba(0, 0, 0, 0)" });
    await s.pin("the NOW BOARDING tag", await A.props(rowOf(page, "dp").locator(".dtag"), ["font-size", "font-weight", "letter-spacing", "padding-left", "border-top-left-radius", "color", "background-color"]));
    await s.pin("the roundel ring of the chosen row", (await A.props(rowOf(page, "dp").locator(".rdl"), ["box-shadow"]))["box-shadow"]);
    await rowOf(page, "bt").hover();
    await s.expect("hovering an unchosen row tints it like the chosen one", async () => (await A.props(rowOf(page, "bt"), ["background-color"]))["background-color"], "rgb(241, 243, 244)");
    await page.mouse.move(640, 3);
    await A.shot("board-dp");
    await A.tab("Dojo");
    await A.tab("Metro");
    await s.expect("the choice survives a visit to another tab", async () => (await board(page)).boardBtn, "Board DP — 10 stops");

    // ---- history on the board
    const B = await s.device({ seed: F.board, motion: true });
    await B.open();
    await B.tab("Metro");
    const bp = B.page;
    blob = F.board;
    await s.expect("with a history: each deck shows its hit rate (graphs, backtracking and DP have been ridden, Heaps & tries not), Mix the overall one, Redemption the three misses as DELAYED", () => board(bp), boardModel(blob, "mix"));
    await s.expect("…in words: Graphs 75% right, Backtracking 100%, DP 20%, Mix 50%, Redemption 3 missed", async () => {
      const b = await board(bp);
      return b.rows.map((r) => r.sub);
    }, [`${D.Q.length} cards · 50% · weakest first`, `${deckStat(blob, "graphs").n} cards · 75% right`, `${deckStat(blob, "bt").n} cards · 100% right`, `${deckStat(blob, "dp").n} cards · 20% right`, `${deckStat(blob, "ds").n} cards · not yet ridden`, "3 missed · win them back"]);
    await s.expect("Redemption is open and carries the orange DELAYED · 3 tag instead of a platform", async () => ({ disabled: await rowOf(bp, "redo").isDisabled(), tag: (await board(bp)).rows[5].tag }), { disabled: false, tag: "dtag:DELAYED · 3:var(--med):color-mix(in srgb, var(--med) 14%, transparent)" });
    await s.expect("the footnote is the lifetime line: 44/61 lifetime · best streak 8 · 6 runs", async () => (await board(bp)).note, "44/61 lifetime · best streak 8 · 6 runs");
    await s.expect("an open Redemption row is not dimmed", async () => (await B.props(rowOf(bp, "redo"), ["opacity", "cursor"])), { opacity: "1", cursor: "pointer" });
    await B.shot("board-history");
    await chooseDeck(B, "redo");
    await s.expect("choosing Redemption: NOW BOARDING replaces DELAYED, the button says Board Redemption", () => board(bp), boardModel(blob, "redo"));
    await B.shot("board-redemption");
    await B.setDark(true);
    await B.shot("board-redemption");
    await chooseDeck(B, "bt");
    await s.expect("choosing another deck brings DELAYED · 3 back", () => board(bp), boardModel(blob, "bt"));
    await B.shot("board-history");
    await B.setDark(false);

    // ---- history, nothing owed
    const C = await s.device({ seed: F.boardClean, motion: true });
    await C.open();
    await C.tab("Metro");
    await s.expect("a history with nothing owed: Redemption closed with 'no misses yet', everything else as ridden", () => board(C.page), boardModel(F.boardClean, "mix"));
    finish(s);
  });

  /* 9 ------------------------------------------------------------------ */
  scenario("09-metro-run", "a run: cards, right and wrong answers, reveals, the streak multiplier, XP, the stops track, ending early, leaving and coming back, seeded decks", async (s) => {
    const A = await s.device({ seed: F.midQuiet, motion: true });
    await A.open();
    await A.tab("Metro");
    const page = A.page;
    const both = async (name) => {
      await A.shot(name);
      await A.setDark(true);
      await A.shot(name);
      await A.setDark(false);
    };

    // ---- the run
    await A.clearFx();
    await boardIt(A, 7);
    await s.expect("Board starts a run: the picker is gone, a card is up at 1/10 with a quiet explanation slot, and nothing was celebrated", async () => ({ picker: await page.locator("#quizArea .dboard").count(), board: await boardBtn(page).count(), counter: (await card(page)).meta[0], fx: (await A.fx()).length }), { picker: 0, board: 0, counter: "-:1/10", fx: 0 });
    await s.pin("random draws taken by starting a Mix run (ten cards picked and shuffled, the first card's options dealt)", await A.draws());
    await s.expect("the metro hero stays above the run", async () => (await heroLine0(page)).h1, "Metro mode");
    const run = await play(s, A, { label: "Mix run", plan: "RRRWRRRRRR", n: 10, shots: { 0: { ask: "card-ask", markAsk: "the first card, unanswered (#quizArea)", markReveal: "the first card, answered right (#quizArea)" }, 2: { reveal: "card-streak", markReveal: "the third card, answered right at x2 (#quizArea)" }, 3: { reveal: "card-wrong", markReveal: "the fourth card, answered wrong (#quizArea)" } } });
    await s.pin("the ten cards of the seed-7 Mix run", run.ids.join(" "));
    await s.expect("the Mix deck with day 3 (backtracking) in focus: five backtracking cards and five others, no card twice", async () => ({ unique: new Set(run.ids).size, bt: countBy(run.ids, (id) => ph(id) === "bt"), other: countBy(run.ids, (id) => ph(id) !== "bt") }), { unique: 10, bt: 5, other: 5 });
    await s.expect("the multiplier: XP climbs 2, 4, 8 (the third in a row doubles), a wrong answer resets it, then 10, 12, 16, 20, 24, and the sixth in a row triples: 30", async () => run.st.xp, 30);
    await s.expect("during the run nothing was celebrated (no toast, no burst)", async () => (await A.fx()).length, 0);
    await s.expect("the header took the run's 30 XP as it went (200 to 230), the streak is untouched", async () => ({ xp: (await hdr(page)).xp, streak: (await hdr(page)).streak }), { xp: "230", streak: "Streak 3/3" });
    const wrongId = run.ids[3];
    const mid = await A.saved();
    await s.expect("what is saved mid-run: ten answered, nine right, each card seen once, the wrong one owed to Redemption, best streak 6, no run counted yet", () => ({ answered: mid.quiz.answered, correct: mid.quiz.correct, perQ: mid.quiz.perQ, missed: mid.quiz.missed, bestStreak: mid.quiz.bestStreak, sessions: mid.quiz.sessions, xp: mid.tracks.google.xp }), {
      answered: 10,
      correct: 9,
      perQ: Object.fromEntries(run.ids.map((id, k) => [id, { seen: 1, right: k === 3 ? 0 : 1 }])),
      missed: [wrongId],
      bestStreak: 6,
      sessions: 0,
      xp: 230,
    });
    await s.expect("…the bug-hunt answers count towards the Exterminator badge: bugRight is the number of bug cards answered right", async () => (await A.blob()).quiz.bugRight, countBy(run.ids.filter((_, k) => k !== 3), (id) => D.Q.find((q) => q.id === id).t === "bug"));
    await A.resume();
    await A.press(nextBtn(page));
    await s.expect("Finish ends the run: the result screen", async () => (await result(page)), { cls: "qwrap result", big: "9/10", sub: "Solid. The missed ones went to Redemption.", row: ["+30|XP", "6|best streak", "1|to redemption"], btns: ["Run it again", "Decks"] });
    await s.expect("…and the run is counted: sessions 1", async () => (await A.saved()).quiz.sessions, 1);
    await A.resume();
    await A.tab("Dojo");
    await A.tab("Metro");
    await s.expect("leaving for another tab and coming back leaves the result where it was", async () => (await result(page)).big, "9/10");
    await both("result");

    // ---- ending early
    await A.seed(8);
    await A.press(page.locator("#quizArea .mbtn", { hasText: "Run it again" }));
    await s.expect("Run it again starts another run on the same deck: card 1/10, nothing carried over (no flame, no multiplier, +0), a different draw", async () => {
      const c = await card(page);
      return { meta: c.meta, stops: c.stops };
    }, { meta: ["-:1/10", "-:+0"], stops: "- - - - - - - - - -" });
    const second = await play(s, A, { label: "Second run, ended early", plan: "RW", n: 10 });
    await s.expect("…and its first two cards are not the first run's (another seed, another deal)", async () => second.ids.join() !== run.ids.slice(0, 2).join(), true);
    await A.press(quitBtn(page));
    const afterQuit = await A.saved();
    await s.expect("End run during a reveal returns to the board with the deck as it was; the two answers stay counted (12 answered, 10 right), no run is added (1)", async () => ({ board: await board(page), answered: afterQuit.quiz.answered, correct: afterQuit.quiz.correct, sessions: afterQuit.quiz.sessions }), { board: boardModel(afterQuit, "mix"), answered: 12, correct: 10, sessions: 1 });
    await A.resume();
    await A.seed(9);
    await A.press(boardBtn(page));
    await A.press(quitBtn(page));
    await s.expect("End run on a card nobody answered: back to the board, nothing counted", async () => ({ picker: await page.locator("#quizArea .dboard").count(), answered: (await A.saved()).quiz.answered }), { picker: 1, answered: 12 });
    await A.resume();

    // ---- a card survives a trip to another tab; an answered card cannot be answered again
    await A.seed(10);
    await A.press(boardBtn(page));
    const pre = await card(page);
    const q = cardOf(pre);
    const rightSlot = pre.opts.findIndex((o) => o.text === q.o[q.a]);
    await A.press(page.locator("#quizArea .opt").nth(rightSlot));
    const revealed = await card(page);
    await A.tab("Dojo");
    await A.tab("Metro");
    await s.expect("a card mid-run is as it was after a visit to the Dojo (same options in the same slots, same reveal)", () => card(page), revealed);
    const xpBefore = (await hdr(page)).xp;
    await page.locator("#quizArea .opt").nth((rightSlot + 1) % 4).click({ force: true, timeout: 1500 }).catch(() => {});
    await s.expect("answering a revealed card again does nothing (the options are disabled): same card, same XP", async () => ({ card: await card(page), xp: (await hdr(page)).xp }), { card: revealed, xp: xpBefore });
    await A.press(quitBtn(page));

    // ---- the decks: ten of their own cards each, the same for the same seed
    const decks = {};
    for (const id of ["graphs", "bt", "dp", "ds"]) {
      await chooseDeck(A, id);
      await boardIt(A, 31);
      decks[id] = await rush(A, "RRRRRRRRRR", { seedBase: 900 });
      await A.press(quitBtn(page));
      await s.expect(`the ${D.DECKS.find((d) => d.id === id).n} deck: ten different cards, every one from that deck`, async () => ({ unique: new Set(decks[id]).size, all: decks[id].every((c) => ph(c) === id) }), { unique: 10, all: true });
      await s.pin(`the ${id} run of seed 31`, decks[id].join(" "));
    }
    // ---- a card with a hole in its code
    const hole = Object.entries(decks).map(([id, ids]) => [id, ids.findIndex((c) => (D.Q.find((q) => q.id === c).code ?? "").includes("____"))]).find(([, k]) => k >= 0);
    await s.expect("one of the four seeded deck runs holds a missing-line card (a ____ in its code)", async () => !!hole, true);
    await chooseDeck(A, hole[0]);
    await boardIt(A, 31);
    if (hole[1] > 0) {
      await rush(A, "R".repeat(hole[1]), { seedBase: 900 });
      await A.seed(900 + hole[1] - 1);
      await A.press(nextBtn(page));
    }
    const holed = await card(page);
    const hq = cardOf(holed);
    await s.expect("a missing-line card: the code is a mono block with each ____ lit up in the amber; the block's text is the card's code word for word", async () => ({ code: holed.code, blanks: holed.blanks, want: hq.code.split("____").length - 1, blank: await A.props("#quizArea pre.code .blank", ["color", "font-weight"]), pre: await A.props("#quizArea pre.code", ["font-size", "line-height", "white-space", "overflow-x", "border-top-left-radius", "padding-top", "padding-left"]) }), {
      code: hq.code,
      blanks: hq.code.split("____").length - 1,
      want: hq.code.split("____").length - 1,
      blank: { color: "rgb(232, 113, 10)", "font-weight": "700" },
      pre: { "font-size": "12px", "line-height": "19.2px", "white-space": "pre", "overflow-x": "auto", "border-top-left-radius": "10px", "padding-top": "12px", "padding-left": "14px" },
    });
    await s.pin("the code block's ground and rule", await A.props("#quizArea pre.code", ["background-color", "border-top-color", "margin-bottom", "tab-size"]));
    await s.marked(A, "a missing-line card (#quizArea)", "#quizArea");
    await A.shot("card-code");
    await A.setDark(true);
    await A.shot("card-code");
    await A.setDark(false);
    await A.press(quitBtn(page));

    const S2 = await s.device({ seed: F.midQuiet, motion: true });
    await S2.open();
    await S2.tab("Metro");
    await boardIt(S2, 7);
    await s.expect("the same seed on a fresh device deals the same ten cards as the first run", async () => (await rush(S2, "RRRRRRRRRR", { seedBase: 500 })).join(" "), run.ids.join(" "));
    await S2.press(quitBtn(S2.page));
    await boardIt(S2, 8);
    await s.expect("another seed deals another run", async () => (await rush(S2, "RRRRRRRRRR", { seedBase: 500 })).join(" ") !== run.ids.join(" "), true);
    finish(s);
  });

  /* 10 ----------------------------------------------------------------- */
  scenario("10-metro-result", "how a run ends: a perfect run (+20, the badge, 70 pieces), 7/10 and 6/10, the Redemption deck and a run of one, the empty deck, the Local's copy", async (s) => {
    const open = async (seed, o = {}) => {
      const A = await s.device({ seed, motion: true, ...o });
      await A.open();
      await A.tab("Metro");
      return A;
    };
    const both = async (A, name) => {
      await A.shot(name);
      await A.setDark(true);
      await A.shot(name);
      await A.setDark(false);
    };

    // ---- a perfect run, climbing a rank on the way
    const P = await open(F.runRank);
    const page = P.page;
    await chooseDeck(P, "graphs");
    await P.clearFx();
    await boardIt(P, 41);
    const perfect = await play(s, P, { label: "Perfect run", plan: "RRRRRRRRRR", n: 10, shots: { 5: { reveal: "card-x3" } } });
    await s.expect("a Graphs run: ten graphs cards, no repeat", async () => ({ unique: new Set(perfect.ids).size, all: perfect.ids.every((id) => ph(id) === "graphs") }), { unique: 10, all: true });
    await s.expect("ten right in a row: 2, 2, 4, 4, 4, 6 ×5 = 46 XP, the sixth onwards at ×3", async () => perfect.st.xp, 46);
    await s.expect("the 4th answer took the XP over 100 (90 + 2 + 2 + 4 + 4 = 102): a rank-up toast and a burst of 60 came up mid-run, and nothing else", async () => feedOf(await P.fx()), ["* Rank up — Pathfinder", "confetti 60"]);
    await P.clearFx();
    await P.press(nextBtn(page));
    await s.expect("Finish on a perfect run: the Perfect Run badge and its burst of 70, then the +20 bonus toast (in that order)", async () => feedOf(await P.fx()), ["* Badge — Perfect Run", "confetti 70", "+20 XP · perfect run"]);
    await s.expect("the result: 10/10, the Google line's perfect copy, 66 XP (the run's 46 and the 20 bonus), best streak 10, none to redemption", () => result(page), { cls: "qwrap result", big: "10/10", sub: "Perfect run. The doors open at Google.", row: ["+66|XP", "10|best streak", "0|to redemption"], btns: ["Run it again", "Decks"] });
    const pb = await P.saved();
    await s.expect("saved: 90 + 46 + 20 = 156 XP, the run counted as perfect, 30 answered, best streak 10, the badge there", () => ({ xp: pb.tracks.google.xp, perfect: pb.quiz.perfect, sessions: pb.quiz.sessions, answered: pb.quiz.answered, correct: pb.quiz.correct, best: pb.quiz.bestStreak, badge: !!pb.badges.perfect }), { xp: 156, perfect: 1, sessions: 2, answered: 30, correct: 25, best: 10, badge: true });
    await s.expect("the header: Pathfinder, 156 XP", async () => ({ rank: (await hdr(page)).rank, xp: (await hdr(page)).xp }), { rank: "Pathfinder", xp: "156" });
    await P.resume();
    await both(P, "result-perfect");
    await P.press(page.locator("#quizArea .mbtn", { hasText: "Decks" }));
    await s.expect("Decks returns to the board with Graphs still chosen, now with the run in its numbers", () => board(page), boardModel(pb, "graphs"));

    // ---- 7 of 10 is "Solid"; 6 of 10 is "Rough"
    const R7 = await open(F.midQuiet);
    await boardIt(R7, 51);
    await rush(R7, "RRRRWWWRRR", { seedBase: 300 });
    await R7.press(nextBtn(R7.page));
    await s.expect("7/10 is the Solid line: 4, 4 and 3... streaks give 2 + 2 + 4 + 4 and 2 + 2 + 4 = 20 XP, best streak 4, three to redemption", () => result(R7.page), { cls: "qwrap result", big: "7/10", sub: "Solid. The missed ones went to Redemption.", row: ["+20|XP", "4|best streak", "3|to redemption"], btns: ["Run it again", "Decks"] });
    await s.expect("a 7/10 run raises no celebration at all", async () => feedOf(await R7.fx()), []);
    await both(R7, "result-solid");

    const R6 = await open(F.midQuiet);
    await boardIt(R6, 52);
    await rush(R6, "WWRRRRWWRR", { seedBase: 300 });
    await R6.press(nextBtn(R6.page));
    await s.expect("6/10 is the Rough line: 2 + 2 + 4 + 4 + 2 + 2 = 16 XP, best streak 4, four to redemption", () => result(R6.page), { cls: "qwrap result", big: "6/10", sub: "Rough stop — Redemption deck is waiting.", row: ["+16|XP", "4|best streak", "4|to redemption"], btns: ["Run it again", "Decks"] });
    await both(R6, "result-rough");
    await R6.press(R6.page.locator("#quizArea .mbtn", { hasText: "Decks" }));
    const b6 = await R6.saved();
    await s.expect("back on the board after those four misses: Redemption is open with 'DELAYED · 4'", async () => ({ board: await board(R6.page), missed: b6.quiz.missed.length }), { board: boardModel(b6, "mix"), missed: 4 });
    await s.expect("…and says so in words", async () => (await board(R6.page)).rows[5].sub + " / " + (await board(R6.page)).rows[5].tag.split(":").slice(0, 2).join(":"), "4 missed · win them back / dtag:DELAYED · 4");
    await R6.resume();

    // ---- the Redemption deck: only what is owed
    const D3 = await open(F.board);
    await chooseDeck(D3, "redo");
    await D3.clearFx();
    await boardIt(D3, 61);
    const owed = F.board.quiz.missed;
    const redo = await play(s, D3, { label: "Redemption run of three", plan: "RWR", n: 3 });
    await s.expect("Redemption deals exactly the three cards owed, in some order", async () => [...redo.ids].sort(), [...owed].sort());
    await s.expect("…the last card offers Finish, and the stops track has three ticks, not ten", async () => ({ nav: (await card(D3.page)).nav, ticks: await D3.page.locator("#quizArea .stops-track i").count() }), { nav: ["quit:End run", "next:Finish"], ticks: 3 });
    await D3.press(nextBtn(D3.page));
    await s.expect("2/3 rounds to the 70% line: Solid, 2 + 2 = 4 XP, best streak 1, one to redemption", () => result(D3.page), { cls: "qwrap result", big: "2/3", sub: "Solid. The missed ones went to Redemption.", row: ["+4|XP", "1|best streak", "1|to redemption"], btns: ["Run it again", "Decks"] });
    const d3b = await D3.saved();
    await s.expect("a right answer takes a card off the owed list, a wrong one leaves it there: only the second card is still owed", async () => d3b.quiz.missed, [redo.ids[1]]);
    await s.expect("a run of three is not a perfect run: no bonus, no badge, no burst", async () => ({ feed: feedOf(await D3.fx()), perfect: d3b.quiz.perfect }), { feed: [], perfect: 0 });
    await D3.resume();

    // ---- a run of one, and then an empty deck that hands the choice back to Mix
    const O = await open(F.redoOne);
    await chooseDeck(O, "redo");
    await s.expect("with one card owed the Board button promises one stop", async () => (await board(O.page)).boardBtn, "Board Redemption — 1 stop");
    await O.clearFx();
    await boardIt(O, 71);
    await s.expect("the run is one card long: 1/1 and a single tick", async () => ({ meta: (await card(O.page)).meta[0], ticks: await O.page.locator("#quizArea .stops-track i").count() }), { meta: "-:1/1", ticks: 1 });
    const one = await play(s, O, { label: "Redemption run of one", plan: "R", n: 1 });
    await O.press(nextBtn(O.page));
    await s.expect("1/1: every card won back, but a run under ten stops is not a perfect run: its own copy, no bonus", async () => ({ res: await result(O.page), feed: feedOf(await O.fx()) }), { res: { cls: "qwrap result", big: "1/1", sub: "All won back. The Redemption deck is clear.", row: ["+2|XP", "1|best streak", "0|to redemption"], btns: ["Run it again", "Decks"] }, feed: [] });
    const ob = await O.saved();
    await s.expect("…the owed list is empty now, and the run is counted but not as perfect", () => ({ missed: ob.quiz.missed, sessions: ob.quiz.sessions, perfect: ob.quiz.perfect, owedWas: one.ids.length }), { missed: [], sessions: 2, perfect: 0, owedWas: 1 });
    await O.resume();
    await O.press(O.page.locator("#quizArea .mbtn", { hasText: "Decks" }));
    await s.expect("back on the board the emptied Redemption deck is no longer chosen: closed and dimmed on its platform, 'no misses yet — clean sheet'", async () => (await board(O.page)).rows[5], { cls: "drow", disabled: true, pressed: "false", rdl: "rdl", glyph: "R", bg: "var(--med)", ring: "", name: "Redemption", sub: "no misses yet — clean sheet", tag: "dplat:P6" });
    await s.expect("…Mix is boarding again, and the board is the model for that", () => board(O.page), boardModel(ob, "mix"));
    await both(O, "board-empty-deck");
    await O.clearFx();
    await O.press(boardBtn(O.page));
    await s.expect("pressing Board starts a Mix run, with nothing to announce", async () => ({ feed: feedOf(await O.fx()), picker: await O.page.locator("#quizArea .dboard").count(), card: await O.page.locator("#quizArea .qwrap").count() }), { feed: [], picker: 0, card: 1 });

    // ---- the Local says its own thing
    const L = await open(F.awsRun);
    await chooseDeck(L, "graphs");
    await L.clearFx();
    await boardIt(L, 81);
    await rush(L, "RRRRRRRRRR", { seedBase: 300 });
    await L.press(nextBtn(L.page));
    await s.expect("a perfect run on the Local: the Local's copy, the same badge, burst and bonus, and the bonus itself carries the Local over 100 XP into Phone Screen (86 + 20), so the rank-up and its 60 come last", async () => ({ feed: feedOf(await L.fx()), res: await result(L.page) }), {
      feed: ["* Badge — Perfect Run", "confetti 70", "+20 XP · perfect run", "* Rank up — Phone Screen", "confetti 60"],
      res: { cls: "qwrap result", big: "10/10", sub: "Perfect run. Day One is getting closer.", row: ["+66|XP", "10|best streak", "0|to redemption"], btns: ["Run it again", "Decks"] },
    });
    await s.expect("the header is the Local's: Phone Screen on 106 XP", async () => ({ rank: (await hdr(L.page)).rank, xp: (await hdr(L.page)).xp }), { rank: "Phone Screen", xp: "106" });
    await both(L, "result-perfect-local");
    finish(s);
  });
}

const heroLine0 = (page) => page.locator("main .hero").evaluate((h) => ({ h1: h.querySelector("h1").textContent, p: h.querySelector("p").textContent }));
