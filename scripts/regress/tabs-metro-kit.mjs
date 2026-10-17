// tabs-metro-kit.mjs: the readers and models for the Metro tab: the departures board, a card, the result.

import { D } from "./tabs-kit.mjs";

export const LOOK = {
  mix: { color: "", glyph: "", text: "var(--ink)" },
  graphs: { color: "var(--blue)", glyph: "G", text: "var(--blue)" },
  bt: { color: "var(--red)", glyph: "B", text: "var(--red)" },
  dp: { color: "var(--yellow)", glyph: "D", text: "var(--med)" },
  ds: { color: "var(--green)", glyph: "H", text: "var(--green)" },
  redo: { color: "var(--med)", glyph: "R", text: "var(--med)" },
};

export const FRESH_NOTE = "Patterns, bug hunts, missing lines, complexity. Tap the right answer — streaks multiply the XP (×2 at 3, ×3 at 6). Wrong ones go to the Redemption deck.";

/** What the board prints per deck: how many cards and your hit rate over them (null until one was seen). */
export function deckStat(blob, id) {
  if (id === "redo") return { n: blob.quiz.missed.length, pct: null };
  const pool = id === "mix" ? D.Q : D.Q.filter((q) => q.ph === id);
  let seen = 0;
  let right = 0;
  for (const q of pool) {
    const s = blob.quiz.perQ[q.id];
    if (s) {
      seen += s.seen;
      right += s.right;
    }
  }
  return { n: pool.length, pct: seen ? Math.round((right / seen) * 100) : null };
}

const subline = (id, n, pct) => {
  if (id === "redo") return n ? `${n} missed · win them back` : "no misses yet — clean sheet";
  const ridden = pct === null ? "not yet ridden" : `${pct}% right`;
  if (id === "mix") return `${n} cards · ` + (pct === null ? "weakest first" : `${pct}% · weakest first`);
  return `${n} cards · ${ridden}`;
};

/** What the departures board ought to be for `blob` with deck `sel` chosen. */
/* Redemption deals only what is owed, up to the usual ten. */
const stopsOf = (blob, deck) => {
  const n = deck === "redo" ? Math.min(blob.quiz.missed.length, 10) : 10;
  return n + (n === 1 ? " stop" : " stops");
};

export function boardModel(blob, sel) {
  const q = blob.quiz;
  return {
    group: "group:Choose a deck",
    title: "Departures — pick a line",
    live: `${D.DECKS.length} lines`,
    rows: D.DECKS.map((d, i) => {
      const look = LOOK[d.id];
      const { n, pct } = deckStat(blob, d.id);
      const on = sel === d.id;
      const off = d.id === "redo" && n === 0;
      const tagStyle = `:${look.text}:color-mix(in srgb, ${look.text} 14%, transparent)`;
      return {
        cls: "drow" + (on ? " sel" : ""),
        disabled: off,
        pressed: String(on),
        rdl: look.color ? "rdl" + (d.id === "dp" ? " onyellow" : "") : "rdl mix",
        glyph: look.glyph,
        bg: look.color,
        ring: look.color && on ? `0 0 0 2px var(--sunken), 0 0 0 3.5px ${look.color}` : "",
        name: d.n,
        sub: subline(d.id, n, pct),
        tag: on ? "dtag:NOW BOARDING" + tagStyle : d.id === "redo" && n > 0 ? `dtag:DELAYED · ${n}` + tagStyle : `dplat:P${i + 1}`,
      };
    }),
    boardBtn: `Board ${D.DECKS.find((d) => d.id === sel).n} — ${stopsOf(blob, sel)}`,
    note: q.answered ? `${q.correct}/${q.answered} lifetime · best streak ${q.bestStreak} · ${q.sessions} runs` : FRESH_NOTE,
  };
}

export const board = (page) =>
  page.locator("#quizArea").evaluate((q) => {
    const g = q.querySelector(".dboard");
    return {
      group: g.getAttribute("role") + ":" + g.getAttribute("aria-label"),
      title: g.querySelector(".dboard-title").textContent,
      live: g.querySelector(".dboard-live").textContent,
      rows: [...g.querySelectorAll(".drow")].map((r) => {
        const rdl = r.querySelector(".rdl");
        const tag = r.querySelector(".dtag, .dplat");
        return {
          cls: r.className,
          disabled: r.disabled,
          pressed: r.getAttribute("aria-pressed"),
          rdl: rdl.className,
          glyph: rdl.textContent,
          bg: rdl.style.background,
          ring: rdl.style.boxShadow,
          name: r.querySelector(".drow-name").textContent,
          sub: r.querySelector(".drow-sub").textContent,
          tag: tag.className + ":" + tag.textContent + (tag.classList.contains("dtag") ? ":" + tag.style.color + ":" + tag.style.background : ""),
        };
      }),
      boardBtn: q.querySelector(".board").textContent.trim(),
      note: q.querySelector(".storenote").textContent,
    };
  });

/** The card a run is on, as plain data (option texts are kept per slot). */
export const card = (page) =>
  page.locator("#quizArea .qwrap").evaluate((w) => ({
    cat: w.querySelector(".qcat").className + ":" + w.querySelector(".qcat").textContent,
    meta: [...w.querySelectorAll(".qmeta > span")].map((e) => (e.className || "-") + ":" + e.textContent),
    q: w.querySelector(".qtext").textContent,
    code: w.querySelector("pre.code")?.textContent ?? null,
    blanks: w.querySelectorAll("pre.code .blank").length,
    opts: [...w.querySelectorAll(".opt")].map((b) => ({ k: b.querySelector(".k").textContent, text: b.childNodes[1].textContent, cls: b.className, disabled: b.disabled })),
    explain: w.querySelector(".explain")?.textContent ?? null,
    nav: [...w.querySelectorAll(".qnav button")].map((b) => b.className + ":" + b.textContent.trim()),
    stops: [...w.querySelectorAll(".stops-track i")].map((i) => i.className || "-").join(" "),
  }));

export const result = (page) =>
  page.locator("#quizArea .qwrap").evaluate((w) => ({
    cls: w.className,
    big: w.querySelector(".big").textContent,
    sub: w.querySelector(".sub").textContent,
    row: [...w.querySelectorAll(".row > span")].map((e) => e.querySelector("b").textContent + "|" + e.lastChild.textContent),
    btns: [...w.querySelectorAll(".mrow .mbtn")].map((b) => b.textContent.trim()),
  }));

/** The bank's card shown by `reading` (cards are told apart by their question). */
export const cardOf = (reading) => {
  const q = D.Q.find((x) => x.q === reading.q);
  if (!q) throw new Error("no card in the bank asks: " + reading.q);
  return q;
};

export const multOf = (streak) => (streak >= 6 ? 3 : streak >= 3 ? 2 : 1);
export const multLabel = (streak) => (streak >= 6 ? "×3" : streak >= 3 ? "×2" : "");

export const CATN = { pat: "Pattern", bug: "Bug hunt", line: "Missing line", cx: "Complexity" };

/** What a card ought to read before it is answered, given where the run stands. */
export function askModel(q, reading, { i, n, streak, xp, results }) {
  return {
    cat: `qcat ${q.t}:${CATN[q.t]}`,
    meta: [`-:${i + 1}/${n}`, streak >= 2 && `streak:${streak}`, multLabel(streak) && `mult:${multLabel(streak)}`, `-:+${xp}`].filter(Boolean),
    q: q.q,
    code: q.code ?? null,
    blanks: q.code ? q.code.split("____").length - 1 : 0,
    letters: ["A", "B", "C", "D"],
    classes: ["opt", "opt", "opt", "opt"],
    disabled: [false, false, false, false],
    texts: [...q.o].sort(),
    explain: null,
    nav: ["quit:End run"],
    stops: stopsModel(n, results),
  };
}

/** …and after it is answered: `slot` was picked, `rightSlot` is the right one. */
export function revealModel(q, reading, { i, n, streak, xp, results, slot, rightSlot }) {
  const m = askModel(q, reading, { i, n, streak, xp, results });
  m.classes = reading.opts.map((_, k) => (k === rightSlot ? "opt right" : k === slot ? "opt wrong" : "opt dim"));
  m.disabled = [true, true, true, true];
  m.explain = q.x;
  m.nav = ["quit:End run", `next:${i + 1 >= n ? "Finish" : "Next stop"}`];
  return m;
}

export const stopsModel = (n, results) => Array.from({ length: n }, (_, k) => (k < results.length ? (results[k] ? "ok" : "ko") : "-")).join(" ");

/** The fields of a card reading a model speaks of: option texts as a sorted set. */
export const cardView = (r) => ({
  cat: r.cat,
  meta: r.meta,
  q: r.q,
  code: r.code,
  blanks: r.blanks,
  letters: r.opts.map((o) => o.k),
  classes: r.opts.map((o) => o.cls),
  disabled: r.opts.map((o) => o.disabled),
  texts: r.opts.map((o) => o.text).sort(),
  explain: r.explain,
  nav: r.nav,
  stops: r.stops,
});
