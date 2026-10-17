// tabs-lib.mjs: what the Tabs suite adds to me-lib's devices. A device is still one browser context behind the
// fake origin, with the clock held by Playwright; this file makes two more things repeatable and adds a few
// instruments for the Line, Metro and Dojo tabs, the shell and the celebrations.
//
//  * Randomness. Math.random is replaced by a seeded generator (mulberry32). The metro's deck sampling and
//    option shuffles draw from it, and so does every confetti piece (its column, fall time and delay), so a run
//    is the same run every time. window.__rand.calls counts the draws, and device.seed(n) restarts the
//    generator: a scenario seeds right before the click that starts a run, so what a run holds does not depend
//    on how much confetti was thrown before it.
//  * Celebrations. window.__fx lists every toast and confetti burst the moment it is added to the page and the
//    moment it leaves, with the key React gave it (the monotonic id the store stamped on it) and the page's time.
//    me-lib's recorder keeps only texts and counts; this one is how the suite sees ids and lifetimes.
//  * Animations. A style digest is taken from computed styles, which in the middle of a transition are
//    in-between values; every digest first finishes whatever transition is running (Animation.finish(), which
//    is what Playwright's own `animations: "disabled"` does just before it captures).
//  * A second digest, per screenshot, over properties me-lib's digest does not look at (transition and
//    animation timing, backdrop-filter, pointer-events, offsets, ...), so a CSS change to a timing, a blur or a
//    hit area cannot hide behind identical pixels.
//
// Everything else (the origin, the clock, the recorder of texts, the screenshot routine) is me-lib's.

import { Device, MeScenario } from "./me-lib.mjs";

/* ------------------------------ page-side scripts ------------------------------ */

const RANDOM_STUB = (seed0) => {
  let a = seed0 >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  window.__rand = {
    calls: 0,
    seed(n) {
      a = n >>> 0;
    },
  };
  Math.random = () => {
    window.__rand.calls++;
    return next();
  };
};

/* Icons carry no names, so a glyph is told by a stroke that sets it apart. */
const GLYPHS = {
  play: 'points="6 3 20 12 6 21 6 3"',
  pause: 'x="14" y="4"',
  check: "M20 6 9 17l-5-5",
  "rotate-ccw": "M3 12a9 9 0 1 0 9-9",
  flame: "M8.5 14.5A2.5 2.5",
  lock: 'rx="2" ry="2"',
  "chevron-down": "m6 9 6 6 6-6",
  "arrow-right": "M5 12h14",
  "arrow-up-right": "M7 7h10v10",
  code: "m16 18 6-6-6-6",
  route: "M9 19h8.5",
  train: "M4 11h16",
  chart: "M18 17V9",
};

const PAGE_HELPERS = (glyphs) => {
  window.__glyph = (svg) => {
    if (!svg) return null;
    const html = svg.innerHTML;
    return Object.keys(glyphs).find((k) => html.includes(glyphs[k])) ?? "?";
  };
  /* The key React gave the component that rendered `el`: for a toast or a confetti burst, the store's id. */
  window.__fkey = (el) => {
    const k = Object.keys(el).find((x) => x.startsWith("__reactFiber$"));
    const f = k ? el[k] : null;
    return f && f.return ? f.return.key : null;
  };
};

/* Every toast and confetti burst, as it enters and as it leaves the page. */
const FX_RECORDER = () => {
  window.__fx = [];
  const live = new Map();
  const kind = (n) => (n.classList.contains("toast") ? "toast" : n.classList.contains("confetti") ? "confetti" : null);
  const found = (n) => (n.nodeType === 1 ? [n, ...n.querySelectorAll(".toast, .confetti")].filter((e) => kind(e)) : []);
  new MutationObserver((records) => {
    for (const r of records) {
      r.addedNodes.forEach((n) =>
        found(n).forEach((e) => {
          const entry = { kind: kind(e), key: window.__fkey(e), at: Date.now(), gone: null };
          if (entry.kind === "toast") {
            entry.msg = e.textContent;
            entry.gold = e.classList.contains("gold");
          } else entry.n = e.querySelectorAll(".cf").length;
          live.set(e, entry);
          window.__fx.push(entry);
        })
      );
      r.removedNodes.forEach((n) =>
        found(n).forEach((e) => {
          const entry = live.get(e);
          if (entry) entry.gone = Date.now();
        })
      );
    }
  }).observe(document, { childList: true, subtree: true });
};

/* ------------------------------ the second digest ------------------------------ */

const EXTRA_PROPS = [
  "transition-property", "transition-delay", "transition-timing-function", "animation-duration", "animation-delay",
  "animation-timing-function", "animation-fill-mode", "animation-iteration-count", "backdrop-filter", "pointer-events",
  "top", "right", "bottom", "left", "text-overflow", "font-variant-numeric", "text-decoration-thickness", "outline-offset",
  "tab-size", "list-style-type", "border-bottom-style", "border-left-style", "border-right-style", "background-position",
  "background-size", "color-scheme", "touch-action", "-webkit-tap-highlight-color", "word-break", "scroll-margin-top",
];
const EXTRA_PSEUDO = ["inset", "transform", "display", "pointer-events", "border-top-width", "border-top-color", "opacity"];

async function extraDigest(roots, { props, pseudo }) {
  if (!roots.length) return "none";
  const lines = [];
  const seen = new Set();
  const visit = (el) => {
    if (seen.has(el) || el.matches(".toasts, .confetti")) return;
    seen.add(el);
    const cs = getComputedStyle(el);
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue.trim()).join(" ").slice(0, 16);
    let line = [el.tagName, own, ...props.map((p) => cs.getPropertyValue(p))].join("|");
    for (const ps of ["::before", "::after"]) {
      const pcs = getComputedStyle(el, ps);
      if (pcs.getPropertyValue("content") !== "none") line += `|${ps}:` + pseudo.map((p) => pcs.getPropertyValue(p)).join(",");
    }
    lines.push(line);
    for (const c of el.children) visit(c);
  };
  roots.forEach(visit);
  const bytes = new TextEncoder().encode(lines.sort().join("\n"));
  const digest = await crypto.subtle.digest("SHA-1", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 12);
}

/* ------------------------------ a device ------------------------------ */

export class TabsDevice extends Device {
  static async create(s, o = {}) {
    const d = new TabsDevice(s, o);
    await d.init();
    return d;
  }

  async init() {
    await super.init();
    await this.ctx.addInitScript(RANDOM_STUB, this.o.random ?? 20260310);
    await this.ctx.addInitScript(PAGE_HELPERS, GLYPHS);
    await this.ctx.addInitScript(FX_RECORDER);
  }

  /* ---- randomness ---- */

  /** Restart the page's random stream at `n`. */
  seed(n) {
    return this.page.evaluate((v) => window.__rand.seed(v), n);
  }

  draws() {
    return this.page.evaluate(() => window.__rand.calls);
  }

  /* ---- the celebrations, with ids and lifetimes ---- */

  fx() {
    return this.page.evaluate(() => window.__fx.map((e) => ({ ...e })));
  }

  clearFx() {
    return this.page.evaluate(() => {
      window.__fx.length = 0;
      window.__toasts.length = 0;
      window.__confetti.length = 0;
    });
  }

  /** Toasts and bursts as they stand on the page now (not as recorded). */
  live() {
    return this.page.evaluate(() => ({
      toasts: [...document.querySelectorAll(".toasts .toast")].map((t) => (t.classList.contains("gold") ? "* " : "") + t.textContent),
      bursts: [...document.querySelectorAll(".confetti")].map((b) => b.querySelectorAll(".cf").length),
    }));
  }

  /* ---- time, storage ---- */

  /** What the device has saved, once the 350 ms save debounce has had its time. The clock is held from here on. */
  async saved() {
    await this.pause();
    await this.advance(400);
    return this.blob();
  }

  /* ---- the page ---- */

  scrollY() {
    return this.page.evaluate(() => Math.round(window.scrollY));
  }

  scrollTo(y) {
    return this.page.evaluate((v) => window.scrollTo({ top: v, behavior: "instant" }), y);
  }

  /** Computed values of `props` for the first element matching `selector` (or a locator), once transitions have settled. */
  async props(target, props, pseudo = null) {
    await this.finishAnimations();
    const loc = typeof target === "string" ? this.page.locator(target).first() : target;
    return loc.evaluate((e, a) => {
      const cs = getComputedStyle(e, a.pseudo);
      return Object.fromEntries(a.props.map((p) => [p, cs.getPropertyValue(p)]));
    }, { props, pseudo });
  }

  rect(target) {
    const loc = typeof target === "string" ? this.page.locator(target).first() : target;
    return loc.evaluate((e) => {
      const r = e.getBoundingClientRect();
      return { x: Math.round(r.x * 10) / 10, y: Math.round(r.y * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 };
    });
  }

  /** The element at a point, described as "tag.class" (or null). */
  at(x, y) {
    return this.page.evaluate(([px, py]) => {
      const e = document.elementFromPoint(px, py);
      return e ? e.tagName.toLowerCase() + (e.className && typeof e.className === "string" ? "." + e.className.trim().split(/\s+/).join(".") : "") : null;
    }, [x, y]);
  }

  /** Finish every running transition and animation, so computed styles are the settled ones. */
  finishAnimations() {
    return this.page.evaluate(() => document.getAnimations().forEach((a) => { try { a.finish(); } catch { /* infinite: none here */ } }));
  }

  /* ---- fingerprints ---- */

  /** me-lib's digest of `target` followed by the second one (see the top of this file). */
  async styles(target = "body") {
    await this.finishAnimations();
    const base = await super.styles(target);
    const loc = typeof target === "string" ? this.page.locator(target) : target;
    const extra = await loc.evaluateAll(extraDigest, { props: EXTRA_PROPS, pseudo: EXTRA_PSEUDO });
    return `${base}; more ${extra}`;
  }
}

/* ------------------------------ a scenario ------------------------------ */

export class TabsScenario extends MeScenario {
  /** Record a value that is true by definition but worth comparing between runs (a computed colour, a measured size):
   *  it goes into an assertion's *name*, so a run that differs shows up in ws-diff as an assertion on one side only.
   *  Used where an expected literal would only be right for one Chromium (colour-mix() results, font metrics). */
  pin(label, value) {
    return this.ok(`${label}: ${typeof value === "string" ? value : JSON.stringify(value)}`, true);
  }

  /** Open a device (see MeScenario.device for the options). Motion is off unless the scenario asks (`motion: true`):
   *  with "reduce" the app draws no confetti and no transition, which is what a still picture wants; the scenarios
   *  about the celebrations and the animations switch it on. */
  device(o = {}) {
    return TabsDevice.create(this, o);
  }
}
