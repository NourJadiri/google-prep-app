// tabs-kit.mjs: what the Tabs suite's scenario files share: the app's content (tabs-data.mjs), the seeded blobs
// (tabs-fixtures.mjs), the readers that turn a part of the page into plain data, and the models that say what
// that data ought to be for a given blob. A reader looks at the page; a model looks at the content and the
// blob and never at the page, so a scenario's expectation is "the page equals the model", spelled out where it
// matters and left to the model where it is bookkeeping (24 stations, 115 problems, 120 cards).

import { loadData } from "./tabs-data.mjs";
import { fixtures } from "./tabs-fixtures.mjs";

export const D = await loadData();
export const F = fixtures(D);

export const SECTIONS = ["Line", "Metro", "Dojo", "Me"];
export const H1 = { Line: "Onsite Express", Metro: "Metro mode", Dojo: "The dojo", Me: "Your line" };
export const GLYPH_OF_TAB = { Line: "route", Metro: "train", Dojo: "code", Me: "chart" };

export const planOf = (track) => (track === "aws" ? D.AWS_PLAN : D.PLAN);
export const unitOf = (track) => (track === "aws" ? "Stop" : "Day");
const allDone = (t, day) => day.probs.every((p) => t.done[p.id]);
export const focusOf = (blob, track = blob.track) => {
  const plan = planOf(track);
  return plan.find((d) => !allDone(blob.tracks[track], d)) ?? plan[plan.length - 1];
};
export const clearedOf = (blob, track = blob.track) => planOf(track).filter((d) => allDone(blob.tracks[track], d)).length;
export const doneCount = (blob, track = blob.track) => planOf(track).flatMap((d) => d.probs).filter((p) => blob.tracks[track].done[p.id]).length;
export const totalOf = (track) => planOf(track).reduce((n, d) => n + d.probs.length, 0);
export const probById = (track, id) => planOf(track).flatMap((d) => d.probs).find((p) => p.id === id);
export const dayById = (track, id) => planOf(track).find((d) => d.id === id);

const dayOf = (track, id) => planOf(track).find((d) => d.probs.some((p) => p.id === id));

/** A tick, as the blob sees it: done, the XP, and the notes an untick left (see `unticked`) dropped once caught up with. */
export const ticked = (b, id, xp, track = b.track) => {
  const t = b.tracks[track];
  const day = dayOf(track, id);
  t.done[id] = true;
  t.xp += xp;
  if (t.peak !== undefined && t.xp >= t.peak) delete t.peak;
  if (t.uncleared?.[day.id] && allDone(t, day)) {
    delete t.uncleared[day.id];
    if (!Object.keys(t.uncleared).length) delete t.uncleared;
  }
};

/** An untick: the XP refunded down to 0 at most; a station it opens again is noted in `uncleared`, a rank it takes back
 *  leaves the XP held before in `peak`, so ticking it again is not celebrated twice. */
export const unticked = (b, id, xp, track = b.track) => {
  const t = b.tracks[track];
  const day = dayOf(track, id);
  if (allDone(t, day)) t.uncleared = { ...t.uncleared, [day.id]: true };
  delete t.done[id];
  const was = t.xp;
  t.xp = Math.max(0, was - xp);
  if (rankModel(track, t.xp).idx < rankModel(track, was).idx) t.peak = Math.max(t.peak ?? 0, was);
};

/** A copy of `blob` with `fn` applied to the draft: how a scenario says "the same, but...". */
export const edit = (blob, fn) => {
  const b = JSON.parse(JSON.stringify(blob));
  fn(b);
  return b;
};

/* ------------------------------ ranks and the header ------------------------------ */

export function rankModel(track, xp) {
  const ranks = track === "aws" ? D.AWS_RANKS : D.RANKS;
  const cols = track === "aws" ? D.AWS_RANKCOL : D.RANKCOL;
  let i = 0;
  ranks.forEach((r, k) => {
    if (xp >= r[1]) i = k;
  });
  const next = ranks[i + 1];
  return {
    idx: i,
    name: ranks[i][0],
    dot: cols[i],
    pct: next ? Math.min(100, Math.round(((xp - ranks[i][1]) / (next[1] - ranks[i][1])) * 100)) : 100,
    next: next ? `${next[1] - xp} XP to ${next[0]}` : "Terminus rank reached",
  };
}

/** What the header ought to say about `blob`. */
export function hdrModel(blob) {
  const t = blob.tracks[blob.track];
  const r = rankModel(blob.track, t.xp);
  const f = focusOf(blob);
  return {
    rank: r.name,
    dot: r.dot,
    streak: `Streak ${blob.streak.cur}/${blob.streak.cur}`,
    xp: String(t.xp),
    fill: r.pct + "%",
    where: `${unitOf(blob.track)} ${f.d} | ${f.stn}`,
    next: r.next,
  };
}

export const hdr = (page) =>
  page.locator("header.hdr").evaluate((h) => ({
    rank: h.querySelector(".rank-name").textContent,
    dot: h.querySelector(".rank-dot").style.background,
    streak: h.querySelector(".hdr-stats > span").getAttribute("aria-label") + "/" + h.querySelector(".hdr-stats > span b").textContent,
    xp: h.querySelector(".hdr-stats > span:last-child b").textContent,
    fill: h.querySelector(".xp-fill").style.width,
    where: h.querySelector(".xp-day").firstChild.textContent + " | " + h.querySelector(".xp-stn").textContent,
    next: h.querySelector(".xp-sub > span:last-child").textContent,
  }));

export const tabBar = (page) =>
  page.locator("nav.tabs").evaluate((n) => ({
    label: n.getAttribute("aria-label"),
    tabs: [...n.querySelectorAll("button")].map((b) => ({
      text: b.textContent.trim(),
      cls: b.className,
      current: b.getAttribute("aria-current"),
      glyph: window.__glyph(b.querySelector(".ic svg")),
      size: b.querySelector("svg").getAttribute("width"),
    })),
  }));

export const view = (page) =>
  page.locator("main").evaluate((m) => ({ views: m.children.length, h1: m.querySelector("h1").textContent, on: m.firstElementChild.className }));

export const noHScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

/* ------------------------------ the line ------------------------------ */

export const heroLine = (page) =>
  page.locator("main .hero").evaluate((h) => ({
    title: h.querySelector("h1").textContent,
    bold: h.querySelector("h1 b").textContent,
    blurb: h.querySelector("p").textContent,
    stats: h.querySelector(".linestats").textContent,
  }));

export const rail = (page) =>
  page.locator(".linewrap > .stn").evaluateAll((els) =>
    els.map((e) => ({
      cls: e.className,
      seg: e.style.getPropertyValue("--seg"),
      title: (e.querySelector(".daycard h2") ?? e.querySelector(".terminus-card h2")).textContent,
      eyebrow: e.querySelector(".eyebrow")?.textContent ?? null,
      expanded: e.querySelector(".dayhead")?.getAttribute("aria-expanded") ?? null,
      prog: e.querySelector(".dayprog i")?.style.width ?? null,
      rows: e.querySelectorAll(".prow").length,
      done: e.querySelectorAll(".prow.done").length,
      tick: window.__glyph(e.querySelector(".stop svg")),
    }))
  );

export function railModel(blob, openIds, track = blob.track) {
  const t = blob.tracks[track];
  const focus = focusOf(blob, track);
  const days = planOf(track).map((d) => {
    const n = d.probs.filter((p) => t.done[p.id]).length;
    const isDone = n === d.probs.length;
    const cls = ["stn", isDone && "done", d.id === focus.id && !isDone && "now", openIds.includes(d.id) && "open"].filter(Boolean).join(" ");
    return {
      cls,
      seg: d.color,
      title: d.name,
      eyebrow: `${unitOf(track)} ${d.d} · ${d.stn}`,
      expanded: String(openIds.includes(d.id)),
      prog: Math.round((n / d.probs.length) * 100) + "%",
      rows: d.probs.length,
      done: n,
      tick: isDone ? "check" : null,
    };
  });
  const T = TERMINUS[track];
  const cleared = clearedOf(blob, track);
  days.push({ cls: "stn terminus", seg: "var(--line)", title: T.title, eyebrow: null, expanded: null, prog: null, rows: 0, done: 0, tick: null });
  return { days, terminusCopy: T.copy(cleared) };
}

export const TERMINUS = {
  google: {
    title: "GOOGLE",
    copy: (n) => (n === D.PLAN.length ? `All ${D.PLAN.length} stations cleared. Walk in like you own the whiteboard.` : `${n} of ${D.PLAN.length} stations behind you. The terminus isn't going anywhere — you are.`),
  },
  aws: {
    title: "DAY ONE",
    copy: (n) => (n === D.AWS_PLAN.length ? `All ${D.AWS_PLAN.length} stops behind you. The doors at Day One are open.` : `${n} of ${D.AWS_PLAN.length} stops behind you. There's no timetable on the Local — ride when you can.`),
  },
};

export const terminusCopy = (page) => page.locator(".terminus-card p").textContent();

/* The rows of the station at position `pos` (0-based) of the line. */
export const rowsAt = (page, pos) =>
  page
    .locator(".linewrap > .stn")
    .nth(pos)
    .locator(".prow")
    .evaluateAll((els) =>
      els.map((li) => {
        const g = li.querySelector(".golink");
        const chk = li.querySelector(".pcheck");
        return {
          cls: li.className,
          name: li.querySelector(".pname").textContent,
          pressed: chk.getAttribute("aria-pressed"),
          label: chk.getAttribute("aria-label"),
          diff: li.querySelector(".diff").className + ":" + li.querySelector(".diff").textContent,
          tags: [...li.querySelectorAll(".pmeta .tag")].map((t) => t.className + ":" + t.textContent),
          xp: li.querySelector(".xpv").textContent,
          link: g && {
            tag: g.tagName,
            cls: g.className,
            label: g.getAttribute("aria-label"),
            title: g.getAttribute("title"),
            href: g.getAttribute("href"),
            target: g.getAttribute("target"),
            rel: g.getAttribute("rel"),
            glyph: window.__glyph(g.querySelector("svg")),
          },
        };
      })
    );

export function rowsModel(blob, dayId, track = blob.track) {
  const t = blob.tracks[track];
  return dayById(track, dayId).probs.map((p) => {
    const inApp = !!(p.slug || p.drill);
    return {
      cls: "prow" + (t.done[p.id] ? " done" : ""),
      name: p.n,
      pressed: String(!!t.done[p.id]),
      label: (t.done[p.id] ? "Uncheck " : "Check ") + p.n,
      diff: `diff ${p.diff}:${D.DIFFN[p.diff]}`,
      tags: [p.warm && "tag:warm-up", p.drill && (p.orig ? "tag:original" : "tag:premium"), t.accepted[p.id] && "tag passed:passed"].filter(Boolean),
      xp: `+${D.probXP(p)} XP`,
      link: inApp
        ? { tag: "BUTTON", cls: "golink code", label: `Solve ${p.n} in the editor`, title: "Open in the editor", href: null, target: null, rel: null, glyph: "code" }
        : p.url
          ? { tag: "A", cls: "golink", label: `Open ${p.n}`, title: null, href: p.url, target: "_blank", rel: "noopener", glyph: "arrow-up-right" }
          : null,
    };
  });
}

/** The ritual row of the station at `pos`, or null. */
export const ritualAt = (page, pos) =>
  page
    .locator(".linewrap > .stn")
    .nth(pos)
    .evaluate((e) => {
      const r = e.querySelector(".ritual");
      return (
        r && {
          cls: r.className,
          pressed: r.getAttribute("aria-pressed"),
          text: r.children[1].textContent,
          xp: r.querySelector(".xpv").textContent,
          fill: r.querySelector(".pcheck").style.background,
          tick: window.__glyph(r.querySelector("svg")),
        }
      );
    });

/* ------------------------------ the celebrations, as recorded ------------------------------ */

/** The toasts of `fx` (a device.fx() list) as "msg" / "* msg" for gold, in the order they entered. */
export const toastsOf = (fx) => fx.filter((e) => e.kind === "toast").map((e) => (e.gold ? "* " : "") + e.msg);
export const burstsOf = (fx) => fx.filter((e) => e.kind === "confetti").map((e) => e.n);
/** Toasts and bursts in one list, in the order the store stamped them (their ids): "* gold toast", "plain toast", "confetti 12". */
export const feedOf = (fx) =>
  [...fx].sort((a, b) => Number(a.key) - Number(b.key)).map((e) => (e.kind === "toast" ? (e.gold ? "* " : "") + e.msg : `confetti ${e.n}`));

/** The toast an XP award carries: "+20 XP · " and the problem's name, cut to 24 characters and an ellipsis past 26. */
export const xpToast = (p) => `+${D.probXP(p)} XP · ${p.n.length > 26 ? p.n.slice(0, 24) + "…" : p.n}`;

/** A blob with the moments (badge and accepted stamps) replaced by true, for comparing what was saved with what was expected. */
export const shape = (blob) => {
  const b = JSON.parse(JSON.stringify(blob));
  for (const k of Object.keys(b.badges)) b.badges[k] = true;
  for (const t of Object.values(b.tracks)) for (const k of Object.keys(t.accepted)) t.accepted[k] = true;
  return b;
};

/** Scroll so that station `pos` of the line starts `margin` px below the top edge. */
export const scrollToStn = (device, pos, margin = 90) =>
  device.page.locator(".linewrap > .stn").nth(pos).evaluate((e, m) => window.scrollTo({ top: e.getBoundingClientRect().top + window.scrollY - m, behavior: "instant" }), margin);

/** Consecutive ids, as the store stamps them: [k, k+1, ...]. */
export const consecutive = (fx) => fx.every((e, i) => i === 0 || Number(e.key) === Number(fx[i - 1].key) + 1);
