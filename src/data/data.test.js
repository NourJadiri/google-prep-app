import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { LC, XPD, RITUAL_XP, PLAN, PROBS, DAY_OF, TOTAL, probXP } from "./plan.js";
import { RANKS, BADGES } from "./meta.js";
import { Q } from "./questions.js";
import { TPL } from "./templates.js";

/* The reference file is ground truth for every string in the app. These tests
   re-evaluate its data <script> block and assert the ported modules still match
   it exactly, so a stray edit to src/data can never drift from the original. */
const REF = path.resolve(import.meta.dirname, "../../reference/onsite-express.html");

function referenceData() {
  const html = fs.readFileSync(REF, "utf8");
  const block = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
  return new Function(block + "; return {LC,XPD,RITUAL_XP,PLAN,RANKS,BADGES,Q,TPL};")();
}

describe("ported data matches the reference verbatim", () => {
  const R = referenceData();

  it("keeps the LeetCode URL helper", () => {
    expect(LC("subsets")).toBe(R.LC("subsets"));
    expect(LC("subsets")).toBe("https://leetcode.com/problems/subsets/");
  });

  it("keeps the XP tables", () => {
    expect(XPD).toEqual(R.XPD);
    expect(RITUAL_XP).toBe(R.RITUAL_XP);
  });

  it("keeps the plan: 7 days, 28 problems, notes and rituals", () => {
    expect(PLAN).toEqual(R.PLAN);
    expect(PLAN).toHaveLength(7);
    expect(TOTAL).toBe(28);
  });

  it("keeps the ranks and badges", () => {
    expect(RANKS).toEqual(R.RANKS);
    expect(BADGES).toEqual(R.BADGES);
    expect(RANKS).toHaveLength(7);
    expect(BADGES).toHaveLength(10);
  });

  it("keeps all 56 quiz cards", () => {
    expect(Q).toEqual(R.Q);
    expect(Q).toHaveLength(56);
  });

  it("keeps all 15 dojo templates", () => {
    expect(TPL).toEqual(R.TPL);
    expect(TPL).toHaveLength(15);
  });
});

describe("data invariants the engine relies on", () => {
  it("stores every correct answer at index 0, with four options", () => {
    for (const q of Q) {
      expect(q.a, q.id).toBe(0);
      expect(q.o, q.id).toHaveLength(4);
    }
  });

  it("has unique question ids and unique problem ids", () => {
    expect(new Set(Q.map((q) => q.id)).size).toBe(Q.length);
    const pids = PLAN.flatMap((d) => d.probs.map((p) => p.id));
    expect(new Set(pids).size).toBe(pids.length);
  });

  it("indexes every problem back to its day without mutating PLAN", () => {
    for (const day of PLAN) {
      for (const p of day.probs) {
        expect(PROBS[p.id]).toBe(p);
        expect(DAY_OF[p.id]).toBe(day);
        expect(p).not.toHaveProperty("day");
      }
    }
  });

  it("values problems by difficulty, with the Day-7 mock overriding to 30", () => {
    expect(probXP(PROBS.btp)).toBe(10);
    expect(probXP(PROBS.ap)).toBe(20);
    expect(probXP(PROBS.nq)).toBe(40);
    expect(probXP(PROBS.mock)).toBe(30);
  });

  it("only uses phases the deck picker knows about", () => {
    expect(new Set(Q.map((q) => q.ph))).toEqual(new Set(["graphs", "bt", "dp", "ds"]));
    expect(new Set(Q.map((q) => q.t))).toEqual(new Set(["pat", "bug", "line", "cx"]));
  });
});
