import { BADGES } from "../../data/meta";
import { TRACKS } from "../../data/tracks";
import type { EngineOpts, Fx, PersistedData, TrackId } from "../../types";
import { daysBetween, todayStr } from "../dates";
import { rankAt, rankIdx } from "./ranks";
import { clone } from "./schema";

export interface Mutation {
  data: PersistedData;
  fx: Fx[];
}

export interface Ctx {
  d: PersistedData;
  fx: Fx[];
  today: string;
  now: number;
  rng: () => number;
}

export function ctxOf(data: PersistedData, opts: EngineOpts = {}): Ctx {
  return {
    d: clone(data),
    fx: [],
    today: opts.today || todayStr(),
    now: opts.now === undefined ? Date.now() : opts.now,
    rng: opts.rng || Math.random,
  };
}

export const out = (c: Ctx): Mutation => ({ data: c.d, fx: c.fx });

export const toast = (c: Ctx, msg: string, gold = false): void => {
  c.fx.push({ kind: "toast", msg, gold });
};

export const confetti = (c: Ctx, n: number): void => {
  c.fx.push({ kind: "confetti", n });
};

export function award(c: Ctx, id: string): boolean {
  if (c.d.badges[id]) return false; // badges are never revoked, never re-announced
  c.d.badges[id] = c.now;
  const b = BADGES.find((x) => x.id === id);
  if (b) toast(c, "Badge — " + b.n, true);
  return true;
}

function touchStreak(c: Ctx): void {
  const st = c.d.streak;
  if (st.last === c.today) return;
  st.cur = st.last && daysBetween(st.last, c.today) === 1 ? st.cur + 1 : 1;
  st.last = c.today;
  if (st.cur > st.best) st.best = st.cur;
  if (st.cur >= 3) award(c, "streak3");
  if (st.cur >= 7) award(c, "streak7");
}

export function addXP(c: Ctx, track: TrackId, n: number, why?: string, quiet?: boolean): void {
  const line = TRACKS[track];
  const t = c.d.tracks[track];
  const was = t.xp;
  const best = rankIdx(line.ranks, Math.max(was, t.peak ?? 0));
  t.xp = Math.max(0, was + n); // a refund can exceed what an imported blob holds
  const after = rankIdx(line.ranks, t.xp);
  // A refund that drops a rank leaves peak behind, so earning the rank back isn't announced twice.
  if (after < rankIdx(line.ranks, was)) t.peak = Math.max(t.peak ?? 0, was);
  else if (t.peak !== undefined && t.xp >= t.peak) delete t.peak;
  if (n <= 0) return;

  if (!quiet) toast(c, "+" + n + " XP" + (why ? " · " + why : ""));
  if (after > best) {
    toast(c, "Rank up — " + rankAt(line.ranks, after)[0], true);
    confetti(c, 60);
    if (after === line.ranks.length - 1) award(c, line.award.top);
  }
  touchStreak(c); // the streak is shared by both lines
}
