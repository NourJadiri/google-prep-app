// tabs-fixtures.mjs: the progress blobs the Tabs suite feeds the app (localStorage `onsite-express-v1`), built from
// the app's own plans so that "the first eleven stations ridden" means whatever the first eleven stations are.
// The blobs have the shape engine.normalize() returns, XP is what the ticks and rituals in them add up to
// unless a seed says otherwise (to stand just under a rank), and every date is relative to the suite's clock:
// 2026-03-10, so a streak last touched "2026-03-09" is one a check today carries on.

const TS = 1_772_000_000_000;
const at = (n) => TS + n * 3_600_000;
const flags = (ids) => Object.fromEntries(ids.map((id) => [id, true]));

export const TODAY = "2026-03-10";
export const YESTERDAY = "2026-03-09";

export function fixtures(D) {
  const { PLAN, AWS_PLAN, Q, probXP, RITUAL_XP } = D;

  const idsOf = (plan, from, to) => plan.slice(from, to).flatMap((d) => d.probs.map((p) => p.id));
  const ritualsOf = (plan, n) => Object.fromEntries(plan.slice(0, n).map((d, i) => [d.id, `2026-03-0${Math.min(i + 1, 9)}`]));
  const xpOf = (plan, done, rituals) =>
    plan.flatMap((d) => d.probs).filter((p) => done.includes(p.id)).reduce((a, p) => a + probXP(p), 0) + Object.keys(rituals).length * RITUAL_XP;

  const blank = () => ({ xp: 0, done: {}, rituals: {}, accepted: {} });
  const quizBlank = () => ({ answered: 0, correct: 0, perQ: {}, missed: [], bestStreak: 0, sessions: 0, perfect: 0, bugRight: 0 });

  /* `g`: the Google line as { done: [ids], rituals: {dayId: date}, accepted: [ids], xp? }, `a` likewise for the Local. */
  function blob({ track = "google", g = {}, a = {}, quiz = {}, badges = {}, streak = { last: "", cur: 0, best: 0 } }) {
    const line = (plan, x) => {
      const done = x.done ?? [];
      const rituals = x.rituals ?? {};
      return {
        xp: x.xp ?? xpOf(plan, done, rituals),
        done: flags(done),
        rituals,
        accepted: Object.fromEntries((x.accepted ?? []).map((id, i) => [id, at(10 + i)])),
      };
    };
    return {
      v: 2,
      track,
      tracks: { google: g === null ? blank() : line(PLAN, g), aws: a === null ? blank() : line(AWS_PLAN, a) },
      quiz: { ...quizBlank(), ...quiz },
      badges: Object.fromEntries(Object.entries(badges).map(([id, n]) => [id, at(n)])),
      streak,
    };
  }

  const day = (id) => PLAN.find((d) => d.id === id);
  const without = (ids, ...drop) => ids.filter((id) => !drop.includes(id));
  const d3 = day("d3").probs.map((p) => p.id);

  /* Quiz history: some cards seen on three of the four decks, none on the fourth. */
  const ofDeck = (ph) => Q.filter((q) => q.ph === ph);
  const seen = (ph, k, seenN, rightN) => Object.fromEntries(ofDeck(ph).slice(0, k).map((q) => [q.id, { seen: seenN, right: rightN }]));
  const history = {
    answered: 61,
    correct: 44,
    perQ: { ...seen("graphs", 3, 4, 3), ...seen("bt", 2, 3, 3), ...seen("dp", 4, 5, 1) },
    bestStreak: 8,
    sessions: 6,
    perfect: 0,
    bugRight: 7,
  };
  const missed3 = [ofDeck("graphs")[0].id, ofDeck("bt")[0].id, ofDeck("dp")[0].id];

  return {
    /* What a first visit looks like once the app has normalised nothing: for expectations, never seeded. */
    fresh: blob({}),
    /* Days 1-2 ridden, a start on day 3 (two of four), two rituals logged, a streak one check from three days. */
    mid: blob({
      g: { done: [...idsOf(PLAN, 0, 2), "lcp", "pp"], rituals: ritualsOf(PLAN, 2), accepted: ["ap", "btp"] },
      quiz: { ...history, perQ: {}, answered: 12, correct: 9, bestStreak: 4, sessions: 1 },
      badges: { first: 1 },
      streak: { last: YESTERDAY, cur: 2, best: 2 },
    }),
    /* The same, with the streak already counted today and no quiz history: nothing but the check itself is celebrated. */
    midQuiet: blob({
      g: { done: [...idsOf(PLAN, 0, 2), "lcp", "pp"], rituals: ritualsOf(PLAN, 2), accepted: ["ap", "btp"] },
      badges: { first: 1 },
      streak: { last: TODAY, cur: 3, best: 3 },
    }),
    /* Day 3 one problem short (the warm-up), 230 XP: the warm-up's 20 XP lands exactly on Backtracker's 250, so the one
       check clears the station and climbs a rank (a threshold counts as reached). Quiet streak. */
    nearClear: blob({
      g: { done: [...idsOf(PLAN, 0, 2), ...without(d3, "tkf")], rituals: ritualsOf(PLAN, 2), xp: 230 },
      badges: { first: 1 },
      streak: { last: TODAY, cur: 3, best: 3 },
    }),
    /* Eleven stations ridden and the twelfth one problem short: the check clears the half-way station. */
    half: blob({
      g: { done: [...idsOf(PLAN, 0, 11), ...without(day("d12").probs.map((p) => p.id), "lsk")], rituals: ritualsOf(PLAN, 11), xp: 1500 },
      badges: { first: 1, ritual5: 2 },
      streak: { last: TODAY, cur: 12, best: 12 },
    }),
    /* Twenty-three stations ridden, the last one a check short, 2735 XP: fifteen short of the top rung. */
    lineEnd: blob({
      g: { done: [...idsOf(PLAN, 0, 23), ...without(day("d24").probs.map((p) => p.id), "mock4")], rituals: ritualsOf(PLAN, 23), xp: 2735 },
      badges: { first: 1, ritual5: 2, half: 3 },
      streak: { last: TODAY, cur: 23, best: 23 },
    }),
    /* Days 1-6 ridden: the focus is day 7, the one with the mock clock. */
    mock: blob({
      g: { done: idsOf(PLAN, 0, 6), rituals: ritualsOf(PLAN, 6) },
      badges: { first: 1, ritual5: 2 },
      streak: { last: TODAY, cur: 6, best: 6 },
    }),
    /* Riding the Local: stops 1-2 done and a start on stop 3. */
    awsMid: blob({
      track: "aws",
      g: { done: idsOf(PLAN, 0, 2), rituals: ritualsOf(PLAN, 2) },
      a: { done: [...idsOf(AWS_PLAN, 0, 2), "move-zeroes", "merge-sorted-array"], accepted: ["contains-duplicate"] },
      badges: { first: 1, aws1: 2 },
      streak: { last: TODAY, cur: 2, best: 2 },
    }),
    /* The Local, stop 3 one short and 175 XP: the check clears the stop and climbs to On the Loop (180). */
    awsNear: blob({
      track: "aws",
      a: { done: [...idsOf(AWS_PLAN, 0, 2), "move-zeroes", "merge-sorted-array", "remove-duplicates-from-sorted-array", "squares-of-a-sorted-array"], xp: 175 },
      badges: { aws1: 2 },
      streak: { last: TODAY, cur: 2, best: 2 },
    }),
    /* The Local: six stops ridden and the seventh one problem short; the check clears the half-way stop. */
    awsHalf: blob({
      track: "aws",
      a: { done: [...idsOf(AWS_PLAN, 0, 6), "binary-search", "search-insert-position", "first-bad-version"] },
      badges: { aws1: 2 },
      streak: { last: TODAY, cur: 5, best: 5 },
    }),
    /* The Local: twelve stops ridden, the last one problem short, 555 XP: the check ends the line and tops the ladder (560). */
    awsEnd: blob({
      track: "aws",
      a: { done: [...idsOf(AWS_PLAN, 0, 12), "single-number", "missing-number", "plus-one"], xp: 555 },
      badges: { aws1: 2, awsHalf: 3 },
      streak: { last: TODAY, cur: 12, best: 12 },
    }),
    /* Quiz history on three decks and three cards owed to Redemption. */
    board: blob({
      g: { done: [...idsOf(PLAN, 0, 2), "lcp", "pp"], rituals: ritualsOf(PLAN, 2) },
      quiz: { ...history, missed: missed3 },
      badges: { first: 1 },
      streak: { last: TODAY, cur: 3, best: 3 },
    }),
    /* The same history with nothing owed. */
    boardClean: blob({
      g: { done: [...idsOf(PLAN, 0, 2), "lcp", "pp"], rituals: ritualsOf(PLAN, 2) },
      quiz: history,
      badges: { first: 1 },
      streak: { last: TODAY, cur: 3, best: 3 },
    }),
    /* One card owed: a Redemption run is a run of one. */
    redoOne: blob({
      g: { done: idsOf(PLAN, 0, 2), rituals: ritualsOf(PLAN, 2) },
      quiz: { ...history, answered: 9, correct: 8, perQ: {}, missed: [ofDeck("bt")[1].id], bestStreak: 4, sessions: 1 },
      badges: { first: 1 },
      streak: { last: TODAY, cur: 3, best: 3 },
    }),
    /* Ten XP short of a rank and a clean streak, for a run to climb with its answers (Pathfinder is 100 XP). */
    runRank: blob({
      g: { done: ["ap", "btp", "ps2", "lsw"], rituals: { d1: "2026-03-01" }, xp: 90 },
      quiz: { answered: 20, correct: 15, bestStreak: 3, sessions: 1 },
      badges: { first: 1 },
      streak: { last: TODAY, cur: 3, best: 3 },
    }),
    /* The Local with some quiz history, for a perfect run's copy. */
    awsRun: blob({
      track: "aws",
      a: { done: idsOf(AWS_PLAN, 0, 1) },
      quiz: { answered: 20, correct: 15, bestStreak: 3, sessions: 1 },
      badges: { aws1: 2 },
      streak: { last: TODAY, cur: 3, best: 3 },
    }),
    /* Four rituals logged: the fifth earns Template Monk. */
    ritual4: blob({
      g: { done: idsOf(PLAN, 0, 4), rituals: ritualsOf(PLAN, 4) },
      badges: { first: 1 },
      streak: { last: TODAY, cur: 4, best: 4 },
    }),
    /* A line with the whole of it ridden. */
    lineDone: blob({
      g: { done: idsOf(PLAN, 0, PLAN.length), rituals: ritualsOf(PLAN, PLAN.length), xp: 3200, accepted: ["ap", "btp", "ps2"] },
      badges: { first: 1, ritual5: 2, half: 3, line: 4, noogler: 5 },
      streak: { last: TODAY, cur: 24, best: 24 },
    }),
  };
}
