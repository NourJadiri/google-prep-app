import { describe, it, expect } from "vitest";
import {
  blank,
  normalize,
  rankIdx,
  rankProgress,
  multiplier,
  fmtT,
  dayDone,
  focusDay,
  stationsCleared,
  problemsDone,
  accuracy,
  toggleProb,
  toggleRitual,
  buildSession,
  pickWeighted,
  startSession,
  answerCard,
  nextCard,
  runResultCopy,
  terminusCopy,
} from "./engine.js";
import { PLAN } from "../data/plan.js";
import { RANKS } from "../data/meta.js";
import { Q, Q_BY_ID } from "../data/questions.js";

/* Deterministic RNG so shuffles and weighted picks are reproducible. */
function lcg(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const STAMP = { today: "2026-08-11", now: 1_723_190_000_000 };
const at = (today, now = 1) => ({ today, now });

/* The correct answer is always stored at index 0; find where the shuffle put it. */
const correctSlot = (s) => s.order.indexOf(0);
const wrongSlot = (s) => s.order.findIndex((o) => o !== 0);

const toasts = (fx) => fx.filter((f) => f.kind === "toast").map((f) => f.msg);

/* Plays a whole run, answering each card right or wrong per `script`. */
function playRun(data, deckId, script, rng = lcg(7)) {
  let session = startSession(data, deckId, { rng }).session;
  const gains = [];
  const allFx = [];
  for (let k = 0; k < script.length; k++) {
    const slot = script[k] ? correctSlot(session) : wrongSlot(session);
    const before = data.xp;
    let res = answerCard(data, session, slot, STAMP);
    data = res.data;
    session = res.session;
    allFx.push(...res.fx);
    gains.push(data.xp - before);

    res = nextCard(data, session, { ...STAMP, rng });
    data = res.data;
    session = res.session;
    allFx.push(...res.fx);
  }
  return { data, session, gains, fx: allFx };
}

/* -------------------------------- ranks --------------------------------- */

describe("rankIdx", () => {
  it("puts zero XP at Wanderer", () => {
    expect(rankIdx(0)).toBe(0);
    expect(RANKS[rankIdx(0)][0]).toBe("Wanderer");
  });

  it("promotes exactly on each threshold, never one XP early", () => {
    const thresholds = [0, 100, 250, 450, 700, 1000, 1350];
    thresholds.forEach((need, i) => {
      expect(rankIdx(need)).toBe(i);
      if (need > 0) expect(rankIdx(need - 1)).toBe(i - 1);
    });
    expect(RANKS[rankIdx(100)][0]).toBe("Pathfinder");
  });

  it("tops out at Noogler and stays there", () => {
    expect(rankIdx(1350)).toBe(6);
    expect(rankIdx(999_999)).toBe(6);
    expect(RANKS[rankIdx(1e9)][0]).toBe("Noogler");
  });

  it("reports progress toward the next rank", () => {
    expect(rankProgress(0)).toMatchObject({ idx: 0, pct: 0, nextLabel: "100 XP to Pathfinder" });
    expect(rankProgress(50).pct).toBe(50);
    expect(rankProgress(1350)).toMatchObject({ pct: 100, nextLabel: "Terminus rank reached" });
  });
});

/* ------------------------------ the line -------------------------------- */

describe("problems and stations", () => {
  const day1 = PLAN[0];
  const day1Ids = day1.probs.map((p) => p.id); // ap 20, btp 10, ps2 20, lsw 10

  it("detects a day as complete only when every problem is checked", () => {
    let data = blank();
    for (const id of day1Ids.slice(0, 3)) ({ data } = toggleProb(data, id, STAMP));
    expect(dayDone(data, day1)).toBe(false);
    expect(stationsCleared(data)).toBe(0);
    expect(focusDay(data).id).toBe("d1");

    const res = toggleProb(data, day1Ids[3], STAMP);
    data = res.data;
    expect(dayDone(data, day1)).toBe(true);
    expect(stationsCleared(data)).toBe(1);
    expect(focusDay(data).id).toBe("d2");
    expect(toasts(res.fx)).toContain("🚉 Pathfinding cleared");
    expect(res.fx.some((f) => f.kind === "confetti" && f.n === 50)).toBe(true);
  });

  it("awards XP by difficulty and refunds exactly the same amount", () => {
    let data = blank();
    for (const id of day1Ids) ({ data } = toggleProb(data, id, STAMP));
    expect(data.xp).toBe(60); // 20 + 10 + 20 + 10
    expect(problemsDone(data)).toBe(4);

    for (const id of day1Ids) ({ data } = toggleProb(data, id, STAMP));
    expect(data.xp).toBe(0);
    expect(data.done).toEqual({});
    expect(problemsDone(data)).toBe(0);
  });

  it("refunds silently but announces the award", () => {
    let data = blank();
    const on = toggleProb(data, "ap", STAMP);
    data = on.data;
    expect(toasts(on.fx)).toContain("+20 XP · All Paths From Source to…");

    const off = toggleProb(data, "ap", STAMP);
    expect(toasts(off.fx)).toEqual([]);
    expect(off.fx).toEqual([]);
  });

  it("values the Day-7 mock at 30 regardless of its difficulty chip", () => {
    let data = blank();
    ({ data } = toggleProb(data, "mock", STAMP));
    expect(data.xp).toBe(30);
  });

  it("floors XP at zero and never revokes a badge", () => {
    let data = blank();
    ({ data } = toggleProb(data, "btp", STAMP)); // +10, earns "first"
    expect(data.badges.first).toBe(STAMP.now);
    data = { ...data, xp: 3 }; // pretend XP was spent elsewhere
    ({ data } = toggleProb(data, "btp", STAMP)); // refund -10 against 3
    expect(data.xp).toBe(0);
    expect(data.badges.first).toBe(STAMP.now);
  });

  it("ignores unknown problem ids", () => {
    const data = blank();
    const res = toggleProb(data, "not-a-problem", STAMP);
    expect(res.data).toBe(data);
    expect(res.fx).toEqual([]);
  });

  it("celebrates the whole line when the seventh station falls", () => {
    let data = blank();
    const all = PLAN.flatMap((d) => d.probs.map((p) => p.id));
    const last = all.pop();
    for (const id of all) ({ data } = toggleProb(data, id, STAMP));
    expect(stationsCleared(data)).toBe(6);
    expect(data.badges.half).toBeTruthy();

    const res = toggleProb(data, last, STAMP);
    expect(stationsCleared(res.data)).toBe(7);
    expect(res.data.badges.line).toBeTruthy();
    expect(res.fx.some((f) => f.kind === "confetti" && f.n === 90)).toBe(true);
    expect(terminusCopy(7)).toBe("All seven stations cleared. Walk in like you own the whiteboard.");
  });

  it("toggles a ritual for 15 XP each way and unlocks Template Monk at five", () => {
    let data = blank();
    for (const d of PLAN.slice(0, 4)) ({ data } = toggleRitual(data, d.id, STAMP));
    expect(data.xp).toBe(60);
    expect(data.badges.ritual5).toBeUndefined();

    const res = toggleRitual(data, "d5", STAMP);
    data = res.data;
    expect(data.xp).toBe(75);
    expect(data.badges.ritual5).toBeTruthy();
    expect(data.rituals.d5).toBe(STAMP.today);

    ({ data } = toggleRitual(data, "d5", STAMP));
    expect(data.xp).toBe(60);
    expect(data.rituals.d5).toBeUndefined();
  });

  it("announces a rank-up with gold and confetti, in that order after the XP toast", () => {
    let data = { ...blank(), xp: 90 };
    const res = toggleProb(data, "ap", STAMP); // 90 + 20 crosses 100
    expect(res.data.xp).toBe(110);
    const msgs = toasts(res.fx);
    expect(msgs[0]).toBe("+20 XP · All Paths From Source to…");
    expect(msgs).toContain("Rank up — Pathfinder");
    expect(res.fx.some((f) => f.kind === "confetti" && f.n === 60)).toBe(true);
  });
});

/* -------------------------------- streaks -------------------------------- */

describe("streaks", () => {
  it("increments on consecutive days, including across a month boundary", () => {
    let data = blank();
    ({ data } = toggleProb(data, "ap", at("2026-07-30")));
    expect(data.streak).toMatchObject({ last: "2026-07-30", cur: 1, best: 1 });

    ({ data } = toggleProb(data, "btp", at("2026-07-31")));
    expect(data.streak.cur).toBe(2);

    ({ data } = toggleProb(data, "ps2", at("2026-08-01")));
    expect(data.streak).toMatchObject({ last: "2026-08-01", cur: 3, best: 3 });
    expect(data.badges.streak3).toBeTruthy();
  });

  it("does not double-count two actions on the same day", () => {
    let data = blank();
    ({ data } = toggleProb(data, "ap", at("2026-08-11")));
    ({ data } = toggleProb(data, "btp", at("2026-08-11")));
    expect(data.streak.cur).toBe(1);
  });

  it("resets to 1 after a gap but keeps the best", () => {
    let data = blank();
    for (const [i, day] of ["2026-08-01", "2026-08-02", "2026-08-03"].entries()) {
      ({ data } = toggleRitual(data, PLAN[i].id, at(day)));
    }
    expect(data.streak).toMatchObject({ cur: 3, best: 3 });

    ({ data } = toggleRitual(data, "d4", at("2026-08-07")));
    expect(data.streak).toMatchObject({ cur: 1, best: 3 });
  });

  it("unlocks Full Week on the seventh consecutive day", () => {
    let data = blank();
    PLAN.forEach((day, i) => {
      ({ data } = toggleRitual(data, day.id, at(`2026-08-0${i + 1}`)));
    });
    expect(data.streak).toMatchObject({ cur: 7, best: 7 });
    expect(data.badges.streak3).toBeTruthy();
    expect(data.badges.streak7).toBeTruthy();
  });

  it("does not touch the streak on a refund", () => {
    let data = blank();
    ({ data } = toggleProb(data, "ap", at("2026-08-01")));
    ({ data } = toggleProb(data, "ap", at("2026-08-09")));
    expect(data.streak).toMatchObject({ last: "2026-08-01", cur: 1 });
  });
});

/* ------------------------------ metro mode ------------------------------- */

describe("a run through metro mode", () => {
  it("pays 2 XP a card, doubling at streak 3 and tripling at 6", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(multiplier)).toEqual([1, 1, 2, 2, 2, 3, 3]);
  });

  it("earns exactly 46 XP for a perfect ten, plus the 20 XP bonus", () => {
    const { data, session, gains } = playRun(blank(), "mix", Array(10).fill(true));

    expect(gains).toEqual([2, 2, 4, 4, 4, 6, 6, 6, 6, 6]);
    expect(gains.reduce((a, b) => a + b, 0)).toBe(46);
    expect(session.xp).toBe(46);
    expect(session.phase).toBe("done");
    expect(session.right).toBe(10);

    expect(data.xp).toBe(66); // 46 + the perfect-run bonus
    expect(data.quiz.perfect).toBe(1);
    expect(data.quiz.sessions).toBe(1);
    expect(data.badges.perfect).toBeTruthy();
    expect(runResultCopy(10, 10)).toBe("Perfect run. The doors open at Google.");
  });

  it("awards the run XP silently — the header is the only feedback", () => {
    const { fx } = playRun(blank(), "mix", [true, true]);
    expect(toasts(fx).some((m) => m.startsWith("+2 XP"))).toBe(false);
    expect(toasts(fx).some((m) => m.startsWith("+4 XP"))).toBe(false);
  });

  it("resets the run streak on a wrong answer and sends the card to Redemption", () => {
    let data = blank();
    let session = startSession(data, "mix", { rng: lcg(3) }).session;
    const rng = lcg(3);

    // Three right: streak climbs to the ×2 band.
    for (let k = 0; k < 3; k++) {
      ({ data, session } = answerCard(data, session, correctSlot(session), STAMP));
      ({ data, session } = nextCard(data, session, { ...STAMP, rng }));
    }
    expect(session.streak).toBe(3);
    expect(session.best).toBe(3);

    const stumbled = session.ids[session.i];
    ({ data, session } = answerCard(data, session, wrongSlot(session), STAMP));

    expect(session.streak).toBe(0);
    expect(session.best).toBe(3); // best survives
    expect(data.quiz.missed).toContain(stumbled);
    expect(data.quiz.perQ[stumbled]).toEqual({ seen: 1, right: 0 });
    expect(session.results).toEqual([true, true, true, false]);
  });

  it("removes a card from Redemption once it is finally answered right", () => {
    let data = blank();
    let session = startSession(data, "mix", { rng: lcg(5) }).session;
    const stumbled = session.ids[0];

    ({ data, session } = answerCard(data, session, wrongSlot(session), STAMP));
    expect(data.quiz.missed).toEqual([stumbled]);

    // The Redemption deck is exactly what you owe.
    const redo = startSession(data, "redo", { rng: lcg(5) });
    expect(redo.session.ids).toEqual([stumbled]);

    const res = answerCard(data, redo.session, correctSlot(redo.session), STAMP);
    expect(res.data.quiz.missed).toEqual([]);
    expect(res.data.quiz.perQ[stumbled]).toEqual({ seen: 2, right: 1 });
  });

  it("never lists the same card twice in Redemption", () => {
    let data = blank();
    let session = startSession(data, "mix", { rng: lcg(11) }).session;
    const id = session.ids[0];
    ({ data, session } = answerCard(data, session, wrongSlot(session), STAMP));
    const again = startSession(data, "redo", { rng: lcg(11) });
    const res = answerCard(data, again.session, wrongSlot(again.session), STAMP);
    expect(res.data.quiz.missed).toEqual([id]);
  });

  it("keeps a short run out of the perfect-run bonus", () => {
    let data = blank();
    ({ data } = answerCard(data, startSession(data, "mix", { rng: lcg(2) }).session, 0, STAMP));
    data.quiz.missed = ["q1"];
    const { data: after, session } = playRun(data, "redo", [true]);
    expect(session.phase).toBe("done");
    expect(after.quiz.perfect).toBe(0);
    expect(after.badges.perfect).toBeUndefined();
  });

  it("tracks lifetime accuracy and the best streak ever", () => {
    const { data } = playRun(blank(), "mix", [true, true, false, true, true]);
    expect(data.quiz.answered).toBe(5);
    expect(data.quiz.correct).toBe(4);
    expect(accuracy(data)).toBe(80);
    expect(data.quiz.bestStreak).toBe(2);
  });

  it("refuses to deal an empty deck", () => {
    const res = startSession(blank(), "redo", { rng: lcg(1) });
    expect(res.session).toBeNull();
    expect(toasts(res.fx)).toEqual(["That deck is empty right now"]);
  });

  it("unlocks Exterminator after twenty bug hunts and Metro Rat after 100 cards", () => {
    let data = blank();
    data.quiz.bugRight = 19;
    data.quiz.answered = 98;
    const bug = Q.find((q) => q.t === "bug");
    let session = startSession(data, "mix", { rng: lcg(9) }).session;
    session = { ...session, ids: [bug.id, bug.id], i: 0 };

    let res = answerCard(data, session, correctSlot(session), STAMP);
    expect(res.data.badges.bugs20).toBeTruthy();
    expect(toasts(res.fx)).toContain("🐞 Badge — Exterminator");

    res = nextCard(res.data, res.session, { ...STAMP, rng: lcg(9) });
    res = answerCard(res.data, res.session, correctSlot(res.session), STAMP);
    expect(res.data.quiz.answered).toBe(100);
    expect(res.data.badges.metro100).toBeTruthy();
  });

  it("deals a fresh option order for every card", () => {
    const seen = new Set();
    let data = blank();
    let session = startSession(data, "mix", { rng: lcg(13) }).session;
    for (let k = 0; k < 10; k++) {
      seen.add(session.order.join(""));
      expect([...session.order].sort()).toEqual([0, 1, 2, 3]);
      ({ data, session } = answerCard(data, session, correctSlot(session), STAMP));
      ({ data, session } = nextCard(data, session, { ...STAMP, rng: lcg(k + 40) }));
    }
    expect(seen.size).toBeGreaterThan(1); // not the stored order every time
  });

  it("picks the copy to match the score band", () => {
    expect(runResultCopy(7, 10)).toBe("Solid. The missed ones went to Redemption.");
    expect(runResultCopy(6, 10)).toBe("Rough stop — Redemption deck is waiting.");
  });
});

/* --------------------------- the session builder -------------------------- */

describe("buildSession", () => {
  it("deals ten unique cards weighted toward the focus phase", () => {
    const data = blank(); // focus is Day 1 → graphs
    expect(focusDay(data).ph).toBe("graphs");

    const ids = buildSession(data, "mix", lcg(21));
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(10);

    const graphs = ids.filter((id) => Q_BY_ID[id].ph === "graphs").length;
    expect(graphs).toBe(5); // half the run, against 18/56 of the bank
  });

  it("front-loads up to three Redemption cards, then still leans on the focus", () => {
    const data = blank();
    data.quiz.missed = ["q46", "q47", "q49"]; // bt, bt, dp — none are graphs
    const ids = buildSession(data, "mix", lcg(22));

    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(10);
    expect(ids).toEqual(expect.arrayContaining(["q46", "q47", "q49"]));
    expect(ids.filter((id) => Q_BY_ID[id].ph === "graphs")).toHaveLength(4);
  });

  it("drops the focus bias on Day 7, which has no single phase", () => {
    let data = blank();
    for (const day of PLAN.slice(0, 6)) {
      for (const p of day.probs) ({ data } = toggleProb(data, p.id, STAMP));
    }
    expect(focusDay(data).ph).toBe("mix");

    const ids = buildSession(data, "mix", lcg(23));
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(10);
    expect(new Set(ids.map((id) => Q_BY_ID[id].ph)).size).toBeGreaterThan(1);
  });

  it("keeps a single-phase deck on-topic", () => {
    for (const ph of ["graphs", "bt", "dp", "ds"]) {
      const ids = buildSession(blank(), ph, lcg(24));
      expect(ids.every((id) => Q_BY_ID[id].ph === ph)).toBe(true);
      expect(ids.length).toBe(Math.min(10, Q.filter((q) => q.ph === ph).length));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("caps Redemption at ten even when you owe more", () => {
    const data = blank();
    data.quiz.missed = Q.slice(0, 14).map((q) => q.id);
    const ids = buildSession(data, "redo", lcg(25));
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(10);
  });

  it("prefers the cards you keep getting wrong", () => {
    const pool = [Q_BY_ID.q1, Q_BY_ID.q2, Q_BY_ID.q3];
    const perQ = {
      q1: { seen: 10, right: 10 }, // nailed it
      q2: { seen: 10, right: 0 }, // never once
      q3: { seen: 10, right: 5 },
    };
    expect(pickWeighted(pool, 3, perQ, () => 0)).toEqual(["q2", "q3", "q1"]);
    expect(pickWeighted(pool, 1, perQ, () => 0)).toEqual(["q2"]);
  });
});

/* ------------------------------ import / boot ----------------------------- */

describe("normalize", () => {
  it("passes a full reference export through unchanged", () => {
    const exported = {
      v: 1,
      xp: 275,
      done: { ap: true, btp: true },
      rituals: { d1: "2026-08-09" },
      quiz: {
        answered: 42,
        correct: 33,
        perQ: { q1: { seen: 3, right: 2 } },
        missed: ["q4"],
        bestStreak: 7,
        sessions: 5,
        perfect: 1,
        bugRight: 11,
      },
      badges: { first: 1_723_190_000_000 },
      streak: { last: "2026-08-10", cur: 4, best: 6 },
    };
    expect(normalize(exported)).toEqual(exported);
  });

  it("fills in nested fields an older export never had", () => {
    const s = normalize({ v: 1, xp: 40, done: { ap: true } });
    expect(s.quiz).toEqual(blank().quiz);
    expect(s.streak).toEqual(blank().streak);
    expect(s.rituals).toEqual({});
    expect(s.badges).toEqual({});
    expect(s.xp).toBe(40);
  });

  it("repairs a half-written quiz block", () => {
    const s = normalize({ v: 1, quiz: { answered: 9, missed: null, perQ: undefined } });
    expect(s.quiz.answered).toBe(9);
    expect(s.quiz.missed).toEqual([]);
    expect(s.quiz.perQ).toEqual({});
    expect(s.quiz.bestStreak).toBe(0);
  });

  it("drops missed ids the question bank no longer has", () => {
    const s = normalize({ v: 1, quiz: { missed: ["q1", "ghost", "q2"] } });
    expect(s.quiz.missed).toEqual(["q1", "q2"]);
  });

  it("returns a fresh line for junk, nulls and other schema versions", () => {
    expect(normalize(null)).toEqual(blank());
    expect(normalize(undefined)).toEqual(blank());
    expect(normalize("nope")).toEqual(blank());
    expect(normalize([])).toEqual(blank());
    expect(normalize({ v: 2, xp: 900 })).toEqual(blank());
    expect(normalize({ xp: 900 })).toEqual(blank());
  });

  it("never restores negative or non-numeric XP", () => {
    expect(normalize({ v: 1, xp: -50 }).xp).toBe(0);
    expect(normalize({ v: 1, xp: "lots" }).xp).toBe(0);
    expect(normalize({ v: 1, xp: NaN }).xp).toBe(0);
  });

  it("keeps imported state independent of the caller's object", () => {
    const src = { v: 1, xp: 10, done: { ap: true } };
    const s = normalize(src);
    s.done.btp = true;
    expect(src.done).toEqual({ ap: true });
  });
});

/* --------------------------------- misc ---------------------------------- */

describe("mock clock formatting", () => {
  it("pads to mm:ss", () => {
    expect(fmtT(25 * 60)).toBe("25:00");
    expect(fmtT(300)).toBe("05:00");
    expect(fmtT(59)).toBe("00:59");
    expect(fmtT(0)).toBe("00:00");
  });
});

describe("immutability", () => {
  it("never mutates the state it was handed", () => {
    const before = blank();
    const snapshot = JSON.stringify(before);
    toggleProb(before, "ap", STAMP);
    toggleRitual(before, "d1", STAMP);
    const s = startSession(before, "mix", { rng: lcg(1) }).session;
    answerCard(before, s, 0, STAMP);
    nextCard(before, s, { ...STAMP, rng: lcg(1) });
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});
