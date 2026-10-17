// Checking problems on the Line: one tick and what follows from it (03), and the milestones a tick can reach:
// a station cleared, a rank climbed, the half-way station, the end of the line, on both lines (04).

import { finish } from "./me-lib.mjs";
import { TODAY, YESTERDAY } from "./tabs-fixtures.mjs";
import {
  D, F, edit, hdr, hdrModel, rail, railModel, rowsAt, rowsModel, terminusCopy, TERMINUS, clearedOf, doneCount, totalOf, planOf,
  probById, focusOf, feedOf, shape, scrollToStn, consecutive, xpToast, heroLine, ticked, unticked,
} from "./tabs-kit.mjs";
import { dayHead } from "./tabs-line.mjs";

const pcheck = (page, name, checked) => page.getByRole("button", { name: (checked ? "Uncheck " : "Check ") + name, exact: true });
const statsText = (b) => `${doneCount(b)} / ${totalOf(b.track)} problems · ${clearedOf(b)} / ${planOf(b.track).length} stations cleared`;
const maxKey = (fx) => Math.max(...fx.map((e) => Number(e.key)));
const minKey = (fx) => Math.min(...fx.map((e) => Number(e.key)));

/** The open cards once the data went from `before` to `after`: a station that became current opens. */
const opened = (open, before, after) => {
  const focus = focusOf(after).id;
  return focus === focusOf(before).id || open.includes(focus) ? open : [...open, focus];
};

export default function register(scenario) {
  /* 3 ------------------------------------------------------------------ */
  scenario("03-line-check", "checking and unchecking a problem: toasts, confetti, row, header, counts, storage; streak badges; the XP floor; the 26/27 name cut", async (s) => {
    const A = await s.device({ seed: F.mid, motion: true });
    await A.open();
    await A.pause();
    const page = A.page;
    const nq = probById("google", "nq");
    let blob = F.mid;

    /* The row, the header, the counts and the saved blob all agree with `b`. */
    const agree = async (label, b, pos = 2, dayId = "d3") => {
      await s.expect(`${label}: the rows, the header and the counts follow`, async () => ({ rows: await rowsAt(page, pos), hdr: await hdr(page), stats: await page.locator(".linestats").textContent() }), { rows: rowsModel(b, dayId), hdr: hdrModel(b), stats: statsText(b) });
      await s.expect(`${label}: what is saved is that blob`, async () => shape(await A.saved()), shape(b));
    };

    await agree("at the start", blob);

    // ---- a tick
    await A.clearFx();
    await pcheck(page, "N-Queens", false).click();
    blob = edit(blob, (b) => {
      ticked(b, "nq", 40);
      b.streak = { last: TODAY, cur: 3, best: 3 };
      b.badges.streak3 = 1;
    });
    await s.expect("ticking N-Queens (HARD, 40 XP) carries the streak to three days, so: the XP toast, then the Heating Up badge (gold) it earned, a burst of 12", async () => feedOf(await A.fx()), ["+40 XP · N-Queens", "* Badge — Heating Up", "confetti 12"]);
    await s.expect("…each celebration got the next id, in order", async () => consecutive([...(await A.fx())].sort((a, b) => a.key - b.key)), true);
    await s.expect("…and on the page: the XP toast above the badge toast, one burst of 12 pieces", () => A.live(), { toasts: ["+40 XP · N-Queens", "* Badge — Heating Up"], bursts: [12] });
    const ids1 = await A.fx();
    await agree("after the tick", blob);
    await s.expect("the row is done: aria-pressed, label 'Uncheck N-Queens', the struck-through name; the card's hairline is at 75%, the header's streak says 3", async () => ({
      row: (await rowsAt(page, 2))[2],
      prog: await page.locator(".dayprog i").nth(2).evaluate((e) => e.style.width),
      streak: (await hdr(page)).streak,
    }), { row: rowsModel(blob, "d3")[2], prog: "75%", streak: "Streak 3/3" });
    await A.advance(3000);
    await s.expect("a few seconds later the toasts and the burst are gone from the page", () => A.live(), { toasts: [], bursts: [] });

    // ---- an untick
    await A.clearFx();
    await pcheck(page, "N-Queens", true).click();
    blob = edit(blob, (b) => unticked(b, "nq", 40));
    await A.advance(500);
    await A.settle();
    await s.expect("unticking is silent: no toast, no burst, the XP refunded", async () => ({ fx: await A.fx(), live: await A.live() }), { fx: [], live: { toasts: [], bursts: [] } });
    await agree("after the untick", blob);
    await s.expect("…the badges stay (they are never revoked), and so does the streak the tick earned", async () => ({ badges: Object.keys((await A.blob()).badges).sort(), streak: (await A.blob()).streak, header: (await hdr(page)).streak }), { badges: ["first", "streak3"], streak: { last: TODAY, cur: 3, best: 3 }, header: "Streak 3/3" });

    // ---- ticked again: the same celebrations, but no second badge
    await A.clearFx();
    await pcheck(page, "N-Queens", false).click();
    blob = edit(blob, (b) => ticked(b, "nq", 40));
    await s.expect("ticking it again: the XP toast and a burst, but Heating Up is not announced twice", async () => feedOf(await A.fx()), ["+40 XP · N-Queens", "confetti 12"]);
    await s.expect("…and the ids carry on upwards from where they were", async () => minKey(await A.fx()) > maxKey(ids1), true);
    await agree("after ticking it again", blob);
    await A.advance(3000);
    await scrollToStn(A, 2);
    await A.shot("checked");
    await A.setDark(true);
    await A.shot("checked");
    await A.setDark(false);

    // ---- a tick on a problem that was accepted in the editor: the 'passed' mark outlives an untick
    await dayHead(page, 0).click();
    await A.clearFx();
    await pcheck(page, "All Paths From Source to Target", true).click();
    blob = edit(blob, (b) => unticked(b, "ap", 20));
    await A.settle();
    await s.expect("unticking All Paths From Source to Target: silent, the 'passed' tag stays, the accepted time is kept", async () => ({ fx: await A.fx(), row: (await rowsAt(page, 0))[0], accepted: Object.keys((await A.saved()).tracks.google.accepted).sort() }), { fx: [], row: rowsModel(blob, "d1")[0], accepted: ["ap", "btp"] });
    await s.expect("…the row has lost its done state and kept the tag", async () => ({ cls: (await rowsAt(page, 0))[0].cls, tags: (await rowsAt(page, 0))[0].tags }), { cls: "prow", tags: ["tag passed:passed"] });
    await agree("after that", blob, 0, "d1");

    // ---- the cut in a long name: 26 characters stay whole, 27 are cut to 24 and an ellipsis
    await dayHead(page, 5).click();
    await dayHead(page, 6).click();
    const dasw = probById("google", "dasw");
    const pess = probById("google", "pess");
    await A.clearFx();
    await pcheck(page, dasw.n, false).click();
    await s.expect("a 27-character name (Design Add and Search Words) is cut in the toast to 24 characters and an ellipsis", async () => toastOf(await A.fx(), 0), "+20 XP · Design Add and Search Wo…");
    await A.clearFx();
    await pcheck(page, pess.n, false).click();
    await s.expect("a 26-character name (Partition Equal Subset Sum) is quoted whole", async () => toastOf(await A.fx(), 0), "+20 XP · Partition Equal Subset Sum");
    await s.expect("…the model's cut agrees", async () => [xpToast(dasw), xpToast(pess)], ["+20 XP · Design Add and Search Wo…", "+20 XP · Partition Equal Subset Sum"]);

    // ---- the XP floor
    const X = await s.device({ seed: edit(F.midQuiet, (b) => { b.tracks.google.xp = 10; }), motion: true });
    await X.open();
    await pcheck(X.page, "Letter Combinations of a Phone Number", true).click();
    await X.advance(10).catch(() => {});
    await s.expect("unticking a 20 XP problem with 10 XP in hand leaves 0, not -10: the header says Wanderer, XP 0, the bar empty", () => hdr(X.page), { rank: "Wanderer", dot: "var(--blue)", streak: "Streak 3/3", xp: "0", fill: "0%", where: "Day 3 | Constraint St.", next: "100 XP to Pathfinder" });
    await s.expect("…and the saved blob says 0 too", async () => (await X.saved()).tracks.google.xp, 0);

    // ---- the streak: a week, and a gap
    const week = edit(F.mid, (b) => { b.streak = { last: YESTERDAY, cur: 6, best: 6 }; b.badges = { first: 1 }; });
    const S = await s.device({ seed: week, motion: true });
    await S.open();
    await S.clearFx();
    await pcheck(S.page, "N-Queens", false).click();
    await s.expect("the seventh day running: the XP toast, then Heating Up and Full Week (in that order)", async () => feedOf(await S.fx()), ["+40 XP · N-Queens", "* Badge — Heating Up", "* Badge — Full Week", "confetti 12"]);
    await s.expect("…and the header's streak is 7", async () => (await hdr(S.page)).streak, "Streak 7/7");
    await s.expect("…saved: streak 7, best 7, both badges", async () => { const b = await S.saved(); return { streak: b.streak, badges: Object.keys(b.badges).sort() }; }, { streak: { last: TODAY, cur: 7, best: 7 }, badges: ["first", "streak3", "streak7"] });
    const gap = edit(F.mid, (b) => { b.streak = { last: "2026-03-05", cur: 5, best: 5 }; delete b.tracks.google.done.pp; b.tracks.google.xp -= 20; });
    const R = await s.device({ seed: gap, motion: true });
    await R.open();
    await R.clearFx();
    await pcheck(R.page, "N-Queens", false).click();
    await s.expect("after a gap of days the streak starts over at 1 (the best stays 5), and no badge is announced", async () => feedOf(await R.fx()), ["+40 XP · N-Queens", "confetti 12"]);
    await s.expect("…saved: cur 1, best 5, last today; the header says Streak 1", async () => ({ streak: (await R.saved()).streak, header: (await hdr(R.page)).streak }), { streak: { last: TODAY, cur: 1, best: 5 }, header: "Streak 1/1" });
    await R.clearFx();
    await pcheck(R.page, "Top K Frequent Elements", false).click();
    await s.expect("a second tick the same day does not touch the streak", async () => ({ feed: feedOf(await R.fx()), streak: (await R.saved()).streak }), { feed: ["+20 XP · Top K Frequent Elements", "confetti 12"], streak: { last: TODAY, cur: 1, best: 5 } });
    const ahead = edit(F.mid, (b) => { b.streak = { last: "2026-03-11", cur: 4, best: 4 }; });
    const T = await s.device({ seed: ahead, motion: true });
    await T.open();
    await T.clearFx();
    await pcheck(T.page, "N-Queens", false).click();
    await s.expect("a streak last touched tomorrow (a clock or time zone ahead) is left alone, not reset: no badge, same days", async () => ({ feed: feedOf(await T.fx()), streak: (await T.saved()).streak }), { feed: ["+40 XP · N-Queens", "confetti 12"], streak: { last: "2026-03-11", cur: 4, best: 4 } });
    finish(s);
  });

  /* 4 ------------------------------------------------------------------ */
  scenario("04-line-milestones", "a tick that clears a station, climbs a rank, reaches half-way or ends the line, on both lines", async (s) => {
    /* Open a device on `seed`, tick `id` and check the celebrations that follow (in the order the engine raises them,
       with consecutive ids, as they stand on the page), then the header, the rail, the counts and the saved blob against
       the blob the tick should have produced. `more` adds to that blob what is not XP (badges). */
    async function ride({ label, seed, id, feed, more = () => {} }) {
      const track = seed.track;
      const A = await s.device({ seed, motion: true });
      await A.open();
      await A.pause();
      const page = A.page;
      const p = probById(track, id);
      const open = [focusOf(seed).id];
      await A.clearFx();
      await pcheck(page, p.n, false).click();
      const after = edit(seed, (b) => {
        ticked(b, id, D.probXP(p));
        more(b);
      });
      await s.expect(`${label}: the celebrations, in the order the engine raises them`, async () => feedOf(await A.fx()), feed);
      await s.expect(`${label}: ...with consecutive ids`, async () => consecutive([...(await A.fx())].sort((a, b) => a.key - b.key)), true);
      await s.expect(`${label}: ...and on the page, toasts stacked in that order (gold ones starred) and the bursts`, () => A.live(), {
        toasts: feed.filter((f) => !f.startsWith("confetti")),
        bursts: feed.filter((f) => f.startsWith("confetti")).map((f) => Number(f.slice(9))),
      });
      const now = opened(open, seed, after);
      await agreeWith(A, label, after, now);
      return { A, page, after, open: now, p };
    }

    /* The header, the rail, the counts and the saved blob agree with `b`, with `open` as the open cards. */
    async function agreeWith(A, label, b, open) {
      const page = A.page;
      await s.expect(`${label}: the header, the rail, the counts and the terminus follow`, async () => ({
        hdr: await hdr(page),
        rail: await rail(page),
        stats: (await heroLine(page)).stats,
        terminus: await terminusCopy(page),
      }), { hdr: hdrModel(b), rail: railModel(b, open).days, stats: statsText(b), terminus: TERMINUS[b.track].copy(clearedOf(b)) });
      await s.expect(`${label}: what is saved is that blob`, async () => shape(await A.saved()), shape(b));
    }

    /* Untick `id` (silent) and tick it again, on a device `ride` returned. The second tick is a plain one: the rank and
       the station it wins back were celebrated the first time. */
    async function undo({ A, page, after, open }, id, label, feed) {
      const p = probById(after.track, id);
      await A.clearFx();
      await pcheck(page, p.n, true).click();
      const back = edit(after, (b) => unticked(b, id, D.probXP(p)));
      await A.advance(300);
      await A.settle();
      await s.expect(`${label}: unticking ${p.n} is silent`, async () => feedOf(await A.fx()), []);
      await agreeWith(A, `${label}, unticked`, back, open);
      await A.clearFx();
      await pcheck(page, p.n, false).click();
      await s.expect(`${label}: ticking it again raises these celebrations`, async () => feedOf(await A.fx()), feed);
      await agreeWith(A, `${label}, ticked again`, after, open);
    }

    // ---- a station cleared, and a rank climbed to the exact XP it asks for
    const tkf = probById("google", "tkf");
    const pp = probById("google", "pp");
    const nc = await ride({
      label: "clearing day 3 from 230 XP",
      seed: F.nearClear,
      id: "tkf",
      feed: [xpToast(tkf), "* Rank up — Backtracker", "confetti 60", "* Constraint St. cleared", "confetti 50"],
    });
    await s.expect("clearing day 3: the XP toast comes first, then the rank-up and its 60-piece burst, then the station's and its 50", async () => feedOf(await nc.A.fx()), ["+20 XP · Top K Frequent Elements", "* Rank up — Backtracker", "confetti 60", "* Constraint St. cleared", "confetti 50"]);
    await s.expect("…day 3 is done and still open, day 4 is now the focus and opens; the header says Backtracker, Day 4 Memo Bridge, and the bar is empty", async () => ({ rail: (await rail(nc.page)).slice(1, 5).map((r) => r.cls), hdr: await hdr(nc.page) }), {
      rail: ["stn done", "stn done open", "stn now open", "stn"],
      hdr: { rank: "Backtracker", dot: "var(--yellow)", streak: "Streak 3/3", xp: "250", fill: "0%", where: "Day 4 | Memo Bridge", next: "200 XP to Memoizer" },
    });
    await s.expect("…the terminus counts three stations", () => terminusCopy(nc.page), "3 of 24 stations behind you. The terminus isn't going anywhere — you are.");
    await scrollToStn(nc.A, 2);
    await nc.A.shot("station-cleared");
    await nc.A.setDark(true);
    await nc.A.shot("station-cleared");
    await nc.A.setDark(false);
    await undo(nc, "pp", "day 3", [xpToast(pp), "confetti 12"]);

    // ---- the half-way station
    const lsk = probById("google", "lsk");
    const half = await ride({
      label: "clearing day 12 (the twelfth station)",
      seed: F.half,
      id: "lsk",
      feed: [xpToast(lsk), "* Union Depot cleared", "confetti 50", "* Badge — Halfway There"],
      more: (b) => { b.badges.half = 1; },
    });
    await s.expect("…the cut name: 41 characters, so 24 and an ellipsis", async () => toastOf(await half.A.fx(), 0), "+20 XP · Longest Substring with A…");
    await s.expect("…twelve stations behind you", () => terminusCopy(half.page), "12 of 24 stations behind you. The terminus isn't going anywhere — you are.");
    await undo(half, "lsk", "half-way", [xpToast(lsk), "confetti 12"]);

    // ---- the end of the line, and the top of the ladder
    const mock4 = probById("google", "mock4");
    const end = await ride({
      label: "clearing day 24 from 2735 XP",
      seed: F.lineEnd,
      id: "mock4",
      feed: [xpToast(mock4), "* Rank up — Offer Letter", "confetti 60", "* Badge — Noogler", "* Final Approach cleared", "confetti 50", "* Badge — End of the Line", "confetti 90"],
      more: (b) => { b.badges.noogler = 1; b.badges.line = 1; },
    });
    await s.expect("the last station: nothing is left to ride, so no station is 'now'; the header is at the top rung and says so", async () => ({ now: (await rail(end.page)).filter((r) => r.cls.includes("now")).length, done: (await rail(end.page)).filter((r) => r.cls.includes("done")).length, hdr: await hdr(end.page) }), {
      now: 0,
      done: 24,
      hdr: { rank: "Offer Letter", dot: "var(--red)", streak: "Streak 23/23", xp: "2765", fill: "100%", where: "Day 24 | Final Approach", next: "Terminus rank reached" },
    });
    await s.expect("…the hero counts every problem, the terminus says the whiteboard is yours", async () => ({ stats: (await heroLine(end.page)).stats, copy: await terminusCopy(end.page) }), { stats: "115 / 115 problems · 24 / 24 stations cleared", copy: "All 24 stations cleared. Walk in like you own the whiteboard." });
    await end.A.shot("line-end", { tall: true });
    await end.A.setDark(true);
    await end.A.shot("line-end", { tall: true });
    await end.A.setDark(false);
    await undo(end, "mock4", "end of the line", [xpToast(mock4), "confetti 12"]);

    // ---- the Local
    const sub = probById("aws", "is-subsequence");
    const loc = await ride({
      label: "clearing stop 3 on the Local from 175 XP",
      seed: F.awsNear,
      id: "is-subsequence",
      feed: [xpToast(sub), "* Rank up — On the Loop", "confetti 60", "* Ballard Locks cleared", "confetti 50"],
    });
    await s.expect("…on the Local the header is the Local's: On the Loop, in its ink, Stop 4 next", () => hdr(loc.page), { rank: "On the Loop", dot: "var(--aws-rust)", streak: "Streak 2/2", xp: "185", fill: "5%", where: "Stop 4 | Fremont", next: "95 XP to Bar Raiser" });
    const sq = probById("aws", "sqrtx");
    await ride({
      label: "clearing stop 7 on the Local (the half-way stop)",
      seed: F.awsHalf,
      id: "sqrtx",
      feed: [xpToast(sq), "* Space Needle cleared", "confetti 50", "* Badge — Halfway House"],
      more: (b) => { b.badges.awsHalf = 1; },
    });
    const hn = probById("aws", "happy-number");
    const aend = await ride({
      label: "clearing stop 13 on the Local from 555 XP",
      seed: F.awsEnd,
      id: "happy-number",
      feed: [xpToast(hn), "* Rank up — Day One", "confetti 60", "* Badge — Day One", "* Doppler cleared", "confetti 50", "* Badge — Doors Open", "confetti 90"],
      more: (b) => { b.badges.awsTop = 1; b.badges.awsLine = 1; },
    });
    await s.expect("…the Local's top rung: Day One, the bar full, and its terminus says the doors are open", async () => ({ hdr: await hdr(aend.page), copy: await terminusCopy(aend.page) }), {
      hdr: { rank: "Day One", dot: "var(--aws-orange)", streak: "Streak 12/12", xp: "565", fill: "100%", where: "Stop 13 | Doppler", next: "Terminus rank reached" },
      copy: "All 13 stops behind you. The doors at Day One are open.",
    });
    await aend.A.shot("line-end-local", { tall: true });
    await aend.A.setDark(true);
    await aend.A.shot("line-end-local", { tall: true });
    finish(s);
  });
}

const toastsOf0 = (fx) => fx.filter((e) => e.kind === "toast").map((e) => e.msg);
const toastOf = (fx, i) => toastsOf0(fx)[i];
