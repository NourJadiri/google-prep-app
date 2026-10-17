import { RITUAL_XP, probXP } from "../../data/plan";
import { DAY_INDEX, PROB_INDEX, TRACKS, type ProblemRef } from "../../data/tracks";
import type { EngineOpts, PersistedData, TrackData, TrackId } from "../../types";
import { addXP, award, confetti, ctxOf, out, toast, type Ctx, type Mutation } from "./kernel";
import { acceptedTotal, dayDone } from "./selectors";

export const setTrack = (data: PersistedData, track: TrackId): PersistedData =>
  data.track === track ? data : { ...data, track };

function forgetUnclear(t: TrackData, dayId: string): void {
  if (!t.uncleared) return;
  delete t.uncleared[dayId];
  if (!Object.keys(t.uncleared).length) delete t.uncleared;
}

function tick(c: Ctx, ref: ProblemRef): void {
  const { prob: p, day, track } = ref;
  const line = TRACKS[track];
  const t = c.d.tracks[track];
  t.done[p.id] = true;
  addXP(c, track, probXP(p), p.n.length > 26 ? p.n.slice(0, 24) + "…" : p.n);
  award(c, line.award.first);

  if (!dayDone(t, day)) {
    confetti(c, 12);
    return;
  }
  // An untick took this clear back, so ticking it again isn't a second clear.
  if (t.uncleared?.[day.id]) {
    forgetUnclear(t, day.id);
    confetti(c, 12);
    return;
  }
  toast(c, day.stn + " cleared", true);
  confetti(c, 50);
  const cleared = line.plan.filter((d) => dayDone(t, d)).length;
  if (cleared >= Math.ceil(line.plan.length / 2)) award(c, line.award.half);
  if (cleared === line.plan.length && award(c, line.award.line)) confetti(c, 90);
}

export function toggleProb(data: PersistedData, id: string, opts?: EngineOpts): Mutation {
  // An id no line carries any more, arriving from a stale export.
  const ref = PROB_INDEX[id];
  if (!ref) return { data, fx: [] };
  const c = ctxOf(data, opts);
  const t = c.d.tracks[ref.track];

  if (t.done[id]) {
    if (dayDone(t, ref.day)) t.uncleared = { ...t.uncleared, [ref.day.id]: true };
    delete t.done[id];
    addXP(c, ref.track, -probXP(ref.prob), "", true);
    return out(c);
  }
  tick(c, ref);
  return out(c);
}

export function acceptProb(data: PersistedData, id: string, opts?: EngineOpts): Mutation {
  const ref = PROB_INDEX[id];
  if (!ref) return { data, fx: [] };
  const was = data.tracks[ref.track];
  const first = !was.accepted[id];
  // A repeat pass writes nothing, so effects see the same data.
  if (!first && was.done[id]) return { data, fx: [] };

  const c = ctxOf(data, opts);
  const t = c.d.tracks[ref.track];
  if (first) t.accepted[id] = c.now;
  if (!t.done[id]) tick(c, ref);
  if (first) {
    award(c, "green");
    if (acceptedTotal(c.d) >= 25) award(c, "green25");
  }
  return out(c);
}

export function toggleRitual(data: PersistedData, dayId: string, opts?: EngineOpts): Mutation {
  const ref = DAY_INDEX[dayId];
  if (!ref) return { data, fx: [] };
  const c = ctxOf(data, opts);
  const t = c.d.tracks[ref.track];
  if (t.rituals[dayId]) {
    delete t.rituals[dayId];
    addXP(c, ref.track, -RITUAL_XP, "", true);
  } else {
    t.rituals[dayId] = c.today;
    addXP(c, ref.track, RITUAL_XP, "ritual");
    if (Object.keys(t.rituals).length >= 5) award(c, "ritual5");
  }
  return out(c);
}
