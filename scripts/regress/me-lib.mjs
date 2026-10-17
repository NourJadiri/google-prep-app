// me-lib.mjs: the plumbing of the Me suite. A "device" is one browser context (so one
// localStorage, one clock, one camera) looking at the app through a fake origin; two
// devices in a scenario are two contexts talking to the same `wrangler dev`, hence the
// same local D1.
//
// What makes a run repeatable:
//
//  * The origin. The app is served to the page as https://yalc.test and every request is
//    forwarded to the real server (BASE) from here. A QR code and the link under it carry
//    location.origin, so this keeps both identical from one run (and one port) to the next;
//    https is also what makes getUserMedia, clipboard and crypto.randomUUID available.
//  * The codes. crypto.randomUUID is replaced with a counter per device, so a minted sync
//    code is a known string (see codeOf()), and so is the QR drawn from it.
//  * The clock. Playwright's clock starts every device at the same instant and keeps time
//    running; a test jumps it (advance) to cross a 4 s debounce, a 30 s retry or a minute
//    without waiting, and pauses it to hold a state (the 1.2 s "Linked" card) for a screenshot.
//  * The network. Every /api/state request goes through here, so it is logged (what the
//    Worker was asked), can be held (to look at "Syncing…"), or can fail.
//  * Toasts and dialogs are recorded rather than watched, and hidden in screenshots; so are a phone's
//    fading scrollbars.
//  * Every screenshot comes with a digest of the page's computed styles (styleDigest), for what a
//    pixel diff with a tolerance cannot see.

import { chromium } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Scenario } from "./harness.mjs";
import { JSQR_SOURCE } from "./me-fixtures.mjs";

export const ORIGIN = "https://yalc.test";
/** Every device's clock starts here (plus its own offset). */
export const T0 = Date.parse("2026-03-10T09:00:00Z");
export const KEY = { data: "onsite-express-v1", sync: "onsite-express-sync-v1" };

const DESKTOP = { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 };
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const PHONE_SE = { viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

/* Toasts and confetti come and go on timers (the recorder below is how they are asserted). On a phone the scrollbars
   are overlays that fade out some while after the page last moved, so there they are not in the pictures either;
   a desktop's are the classic kind and stay put. */
const HIDE_CSS = ".toasts, .confetti, .cf { visibility: hidden !important; }";
const HIDE_SCROLLBARS = ":root, .qrsheet { scrollbar-width: none !important; }";

let BASE = null;
let OUT = null;
let SHARED = null;

export function configure({ base, out, browser }) {
  BASE = base;
  OUT = out;
  SHARED = browser;
}

export const launchOptions = () => ({ executablePath: process.env.CHROMIUM_PATH || undefined, ignoreDefaultArgs: ["--hide-scrollbars"] });

/** The sync code the `n`th crypto.randomUUID() call of device `dev` ("a", "b", …) in scenario `NN` returns. */
export const codeOf = (scn, dev, n = 1) => `me${String(scn).padStart(2, "0")}${dev}000-0000-4000-8000-${String(n).padStart(12, "0")}`;
/** The link a QR carries, as the app builds it. */
export const linkOf = (code, dir) => `${ORIGIN}/#sync=${code}&do=${dir}`;

/* ------------------------------ the Worker's side ------------------------------ */

/* `wrangler dev` now and then answers a request, under load, with its runtime's own plain-text 500 ("Error: Network
   connection lost.") instead of the Worker's JSON: that is the local D1 stumbling, not the app. Such an answer is asked
   for again (a few times); the Worker's own answers, errors included, are JSON and are never retried. */
const transient = (status, contentType) => status >= 500 && !/json/.test(contentType ?? "");
const RETRIES = 4;

async function viaWorker(url, init) {
  let r = await fetch(url, init);
  for (let i = 0; i < RETRIES && transient(r.status, r.headers.get("content-type")); i++) {
    await new Promise((done) => setTimeout(done, 150 * (i + 1)));
    r = await fetch(url, init);
  }
  return r;
}

/** What the Worker (so D1) holds, asked directly rather than through any device. */
export const d1 = {
  async get(code) {
    const r = await viaWorker(`${BASE}/api/state/${encodeURIComponent(code)}`);
    return { status: r.status, body: await r.json() };
  },
  async put(code, updatedAt, data) {
    const r = await viaWorker(`${BASE}/api/state/${encodeURIComponent(code)}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ updatedAt, data }),
    });
    return { status: r.status, body: await r.json() };
  },
  async del(code) {
    await viaWorker(`${BASE}/api/state/${encodeURIComponent(code)}`, { method: "DELETE" });
  },
};

/* ------------------------------ the network, as one device sees it ------------------------------ */

class Net {
  constructor() {
    /** Every /api/state request that left the page: { method, code, status, sent }. */
    this.log = [];
    /** Requests that left the page and have no answer yet. */
    this.inflight = 0;
    /** true: every /api request fails the way an offline browser's does. */
    this.down = false;
    /** a status code: every /api request is answered with it. */
    this.fail = null;
    /** true: every /api request is answered 200 with something that is not JSON. */
    this.garble = false;
    this.gate = null;
  }

  /** Hold every /api request where it is until the returned function is called. */
  hold() {
    let release;
    const p = new Promise((r) => (release = r));
    this.gate = { p };
    return () => {
      this.gate = null;
      release();
    };
  }

  /** The requests of one kind, optionally for one code: net.count("PUT"), net.count("GET", code). */
  list(method, code) {
    return this.log.filter((e) => (!method || e.method === method) && (!code || e.code === code));
  }

  count(method, code) {
    return this.list(method, code).length;
  }

  mark() {
    return this.log.length;
  }

  since(mark, method, code) {
    return this.log.slice(mark).filter((e) => (!method || e.method === method) && (!code || e.code === code));
  }
}

/* ------------------------------ page-side scripts ------------------------------ */

/* Runs in every document before the app: records the toasts and confetti bursts that
   appear (they expire after 3 s, so a poll for them would be a race), and gives the
   scenario a way to fake the tab going to the background. */
const RECORDER = () => {
  window.__toasts = [];
  window.__confetti = [];
  const take = (n) => {
    if (n.nodeType !== 1) return;
    const toasts = n.classList.contains("toast") ? [n] : [...n.querySelectorAll(".toast")];
    for (const t of toasts) window.__toasts.push({ msg: t.textContent, gold: t.classList.contains("gold") });
    const bursts = n.classList.contains("confetti") ? [n] : [...n.querySelectorAll(".confetti")];
    for (const b of bursts) window.__confetti.push(b.querySelectorAll(".cf").length);
  };
  new MutationObserver((records) => records.forEach((r) => r.addedNodes.forEach(take))).observe(document, { childList: true, subtree: true });
  /* Requests the page has started and not yet finished with: from fetch() to the end of reading the body (the app
     reads every answer with res.json()), so a scenario can tell the app has seen them and acted on them. */
  window.__pendingFetch = 0;
  const track = (p) => {
    window.__pendingFetch++;
    p.then(() => window.__pendingFetch--, () => window.__pendingFetch--);
    return p;
  };
  const realFetch = window.fetch.bind(window);
  window.fetch = (...args) => track(realFetch(...args));
  for (const m of ["json", "text"]) {
    const real = Response.prototype[m];
    Response.prototype[m] = function () {
      return track(real.call(this));
    };
  }
  window.__setHidden = (hidden) => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => (hidden ? "hidden" : "visible") });
    document.dispatchEvent(new Event("visibilitychange"));
  };
};

const UUID_STUB = (prefix) => {
  let n = 0;
  const mint = () => `${prefix}-0000-4000-8000-${String(++n).padStart(12, "0")}`;
  Object.defineProperty(crypto, "randomUUID", { configurable: true, value: mint });
};

const NO_STORAGE = () => {
  const boom = () => {
    throw new DOMException("The operation is insecure.", "SecurityError");
  };
  Storage.prototype.setItem = boom;
  Storage.prototype.getItem = boom;
  Storage.prototype.removeItem = boom;
};

/* What CSS makes of a surface, as one short hash: for every element in it (and under it), its tag, its own text,
   its box relative to the surface's corner, and the computed values of the properties below, including what its
   ::before and ::after draw. Lines are sorted and class names are left out, so wrapper elements that draw nothing
   do not change it; a colour, a size, a spacing or a font does. This is for the changes too small for a screenshot
   diff to see (it ignores a channel difference of 8 or less out of 255). */
const STYLE_PROPS = [
  "display", "position", "box-sizing", "width", "height", "min-width", "min-height", "max-width", "max-height",
  "margin-top", "margin-right", "margin-bottom", "margin-left", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
  "border-top-style", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
  "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
  "color", "background-color", "background-image", "opacity", "filter", "box-shadow", "outline-style", "outline-width", "outline-color",
  "fill", "stroke", "stroke-width", "font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing",
  "text-transform", "text-align", "text-decoration-line", "white-space", "overflow-x", "overflow-y", "overflow-wrap",
  "gap", "grid-template-columns", "flex-direction", "align-items", "justify-content", "flex-grow", "flex-shrink",
  "z-index", "cursor", "visibility", "transform", "transition-duration", "animation-name", "user-select", "aspect-ratio",
];
const PSEUDO_PROPS = ["content", "position", "top", "right", "bottom", "left", "width", "height", "background-color", "border-radius"];

async function styleDigest(roots, { props, pseudo }) {
  if (!roots.length) return "none";
  const origin = roots[0].getBoundingClientRect();
  const lines = [];
  const seen = new Set();
  const visit = (el) => {
    if (seen.has(el) || el.matches(".toasts, .confetti")) return;
    seen.add(el);
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue.trim()).join(" ").slice(0, 24);
    const box = [r.x - origin.x, r.y - origin.y, r.width, r.height].map((v) => Math.round(v * 10) / 10).join(",");
    let line = [el.tagName, own, box, ...props.map((p) => cs.getPropertyValue(p))].join("|");
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
  return `${lines.length} elements, ` + [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 12);
}

/* What navigator.clipboard does when the browser says no (or has no clipboard at all). */
const CLIPBOARD = (mode) => {
  window.__clip = [];
  const fake = {
    writeText: (t) => {
      window.__clip.push(t);
      if (mode === "throws") throw new DOMException("blocked", "NotAllowedError");
      return Promise.reject(new DOMException("Write permission denied.", "NotAllowedError"));
    },
    readText: () => Promise.reject(new DOMException("Read permission denied.", "NotAllowedError")),
  };
  Object.defineProperty(navigator, "clipboard", { configurable: true, get: () => (mode === "absent" ? undefined : fake) });
};

/* The camera, instrumented. window.__cam.calls are the getUserMedia constraints asked for,
   window.__cam.streams the streams handed out (their tracks' readyState says whether the
   light is still on). `mode`: real | denied | notfound | overconstrained (the first ask is
   refused, the retry is real) | hold (the answer waits for window.__camRelease()).
   `detector`: absent (no BarcodeDetector, so jsQR reads) | fake (a BarcodeDetector backed by
   jsQR, counting its use; with `foreignOnce` it instead sees a QR that is not ours on its first
   look and nothing after) | throws (a class whose constructor throws, so jsQR reads). */
const CAMERA = ({ mode, detector, foreignOnce }) => {
  window.__cam = { calls: [], streams: [] };
  window.__bd = { made: [], detects: 0 };
  const md = navigator.mediaDevices;
  if (md) {
    const real = md.getUserMedia.bind(md);
    md.getUserMedia = async (c) => {
      window.__cam.calls.push(c);
      const n = window.__cam.calls.length;
      if (mode === "denied") throw new DOMException("Permission denied", "NotAllowedError");
      if (mode === "notfound") throw new DOMException("Requested device not found", "NotFoundError");
      if (mode === "overconstrained" && n === 1) throw new DOMException("Constraint not satisfiable", "OverconstrainedError");
      if (mode === "hold") await new Promise((r) => (window.__camRelease = r));
      const s = await real(c);
      window.__cam.streams.push(s);
      return s;
    };
  }
  if (detector === "absent") {
    window.BarcodeDetector = undefined;
  } else if (detector === "throws") {
    window.BarcodeDetector = class {
      constructor() {
        throw new Error("qr_code is not supported");
      }
    };
  } else if (detector === "fake") {
    window.BarcodeDetector = class {
      constructor(opts) {
        window.__bd.made.push(opts);
      }
      async detect(el) {
        window.__bd.detects++;
        if (foreignOnce) return window.__bd.detects === 1 ? [{ rawValue: "hello world" }] : [];
        if (!el.videoWidth) return [];
        const c = document.createElement("canvas");
        c.width = el.videoWidth;
        c.height = el.videoHeight;
        const g = c.getContext("2d");
        g.drawImage(el, 0, 0);
        const f = g.getImageData(0, 0, c.width, c.height);
        const hit = window.jsQR(f.data, c.width, c.height, { inversionAttempts: "dontInvert" });
        return hit ? [{ rawValue: hit.data }] : [];
      }
    };
  }
};

/* ------------------------------ a device ------------------------------ */

export class Device {
  /** Open one: Device.create(scenario, { name, phone, dark, ... }). See the option list in the body. */
  static async create(s, o = {}) {
    const d = new Device(s, o);
    await d.init();
    return d;
  }

  constructor(s, o) {
    this.s = s;
    this.name = o.name ?? String.fromCharCode(97 + s.devices.length);
    this.o = o;
    this.phone = !!(o.phone || o.se);
    this.form = o.se ? "phone-se" : this.phone ? "phone" : "desktop";
    this.theme = o.dark ? "dark" : "light";
    this.net = new Net();
    this.dialogs = [];
    /** What the next confirm()/alert() is answered with. */
    this.accept = false;
    this.paused = false;
    s.devices.push(this);
  }

  async init() {
    const o = this.o;
    const browser = o.browser ?? SHARED;
    const permissions = [...(o.clipboard === false ? [] : ["clipboard-read", "clipboard-write"]), ...(o.camera ? ["camera"] : [])];
    this.ctx = await browser.newContext({
      ...(o.se ? PHONE_SE : this.phone ? PHONE : DESKTOP),
      colorScheme: o.dark ? "dark" : "light",
      reducedMotion: o.motion ? "no-preference" : "reduce",
      locale: "en-US",
      timezoneId: "UTC",
      permissions,
    });
    await this.ctx.clock.install({ time: new Date(T0 + (o.clockOffset ?? 0)) });
    await this.ctx.addInitScript(RECORDER);
    await this.ctx.addInitScript(UUID_STUB, `me${this.s.no}${this.name}000`);
    if (o.noStorage) await this.ctx.addInitScript(NO_STORAGE);
    if (o.clipboardStub) await this.ctx.addInitScript(CLIPBOARD, o.clipboardStub);
    const seeds = { ...(o.storage ?? {}) };
    if (o.seed) seeds[KEY.data] = JSON.stringify(o.seed);
    if (o.syncCfg) seeds[KEY.sync] = typeof o.syncCfg === "string" ? o.syncCfg : JSON.stringify(o.syncCfg);
    if (Object.keys(seeds).length) {
      // Per-origin pre-seeding that runs before the app does, once per document (a reload keeps what the app wrote).
      await this.ctx.addInitScript((kv) => {
        try {
          for (const [k, v] of Object.entries(kv)) if (localStorage.getItem(k) === null) localStorage.setItem(k, v);
        } catch {
          /* storage blocked: nothing to seed */
        }
      }, seeds);
    }
    if (o.camera) {
      await this.ctx.addInitScript({ content: JSQR_SOURCE });
      await this.ctx.addInitScript(CAMERA, { mode: o.camera.mode ?? "real", detector: o.camera.detector ?? "absent", foreignOnce: !!o.camera.foreignOnce });
    }
    await this.ctx.route(`${ORIGIN}/**`, (route) => this.forward(route));
    this.page = await this.ctx.newPage();
    this.page.setDefaultTimeout(20_000);
    this.page.on("pageerror", (e) => this.s.pageErrors.push(`${this.name}: ${e.message}`));
    this.page.on("console", (m) => {
      if (m.type() === "error" && !/Failed to load resource/.test(m.text())) this.s.consoleErrors.push(m.text().slice(0, 300));
    });
    this.page.on("dialog", async (d) => {
      const entry = { type: d.type(), message: d.message() };
      this.dialogs.push(entry);
      this.s.dialogs.push(`${this.name}: ${entry.type}: ${entry.message}`);
      if (this.accept) await d.accept();
      else await d.dismiss();
    });
  }

  /* Serve the app from the fake origin: forward to the real server, with the /api/state
     traffic logged and, when a scenario asks, held or broken. */
  async forward(route) {
    const net = this.net;
    const req = route.request();
    const u = new URL(req.url());
    const api = u.pathname.startsWith("/api/state/");
    let entry = null;
    if (api) {
      let sent = null;
      try {
        sent = JSON.parse(req.postData() ?? "null");
      } catch {
        /* not JSON */
      }
      entry = { method: req.method(), code: decodeURIComponent(u.pathname.slice("/api/state/".length)), status: null, sent };
      net.log.push(entry);
      net.inflight++;
    }
    try {
      if (api && net.gate) await net.gate.p;
      if (api && net.down) {
        entry.status = "down";
        await route.abort("connectionfailed");
        return;
      }
      if (api && net.fail) {
        entry.status = net.fail;
        await route.fulfill({ status: net.fail, contentType: "application/json", body: JSON.stringify({ error: "injected" }) });
        return;
      }
      if (api && net.garble) {
        entry.status = "garbled";
        await route.fulfill({ status: 200, contentType: "text/html", body: "<html>not json</html>" });
        return;
      }
      let res = await route.fetch({ url: BASE + u.pathname + u.search });
      for (let i = 0; api && i < RETRIES && transient(res.status(), res.headers()["content-type"]); i++) {
        await new Promise((done) => setTimeout(done, 150 * (i + 1)));
        res = await route.fetch({ url: BASE + u.pathname + u.search });
      }
      if (entry) entry.status = res.status();
      await route.fulfill({ response: res });
    } catch {
      if (entry && entry.status === null) entry.status = "error";
      await route.abort().catch(() => {});
    } finally {
      if (api) net.inflight--;
    }
  }

  /* ---- navigation ---- */

  async open(hash = "") {
    await this.page.goto(`${ORIGIN}/${hash}`);
    await this.page.getByRole("navigation", { name: "Sections" }).waitFor();
    return this;
  }

  async reload() {
    await this.page.reload();
    await this.page.getByRole("navigation", { name: "Sections" }).waitFor();
  }

  press(loc) {
    return this.phone ? loc.tap() : loc.click();
  }

  async tab(label) {
    await this.press(this.page.getByRole("navigation", { name: "Sections" }).getByRole("button", { name: label, exact: true }));
  }

  /** Open the app on the Me tab. */
  async openMe(hash = "") {
    await this.open(hash);
    await this.tab("Me");
    await this.page.locator("#meArea").waitFor();
    return this;
  }

  /* ---- storage ---- */

  ls(key) {
    return this.page.evaluate((k) => {
      try {
        const raw = localStorage.getItem(k);
        return raw === null ? null : JSON.parse(raw);
      } catch {
        return "<unreadable>";
      }
    }, key);
  }

  /** The progress blob the app has saved (null until its first save), the sync config likewise. */
  blob() {
    return this.ls(KEY.data);
  }

  cfg() {
    return this.ls(KEY.sync);
  }

  /* ---- toasts, dialogs ---- */

  toastLog() {
    return this.page.evaluate(() => window.__toasts);
  }

  async clearToasts() {
    await this.page.evaluate(() => (window.__toasts.length = 0));
  }

  /** The messages of the toasts since the last clearToasts(), gold ones starred. */
  async toasts() {
    return (await this.toastLog()).map((t) => (t.gold ? "* " : "") + t.msg);
  }

  confettiLog() {
    return this.page.evaluate(() => window.__confetti);
  }

  /** Answer the confirm()s that happen inside `fn` with `accept`, and return what was asked. */
  async answering(accept, fn) {
    this.accept = accept;
    this.dialogs.length = 0;
    try {
      await fn();
    } finally {
      this.accept = false;
    }
    return this.dialogs.map((d) => `${d.type}: ${d.message}`);
  }

  /* ---- fingerprints ---- */

  /** The style digest (see styleDigest) of everything `target` (a selector or a locator) matches, with the pointer parked out of the way. */
  async styles(target = "body") {
    if (!this.phone) await this.page.mouse.move(640, 3);
    const loc = typeof target === "string" ? this.page.locator(target) : target;
    return loc.evaluateAll(styleDigest, { props: STYLE_PROPS, pseudo: PSEUDO_PROPS });
  }

  /** A hash of the markup of `selector`: same elements, same attributes, same text. */
  markup(selector) {
    return this.page.locator(selector).evaluate(async (e) => {
      const bytes = new TextEncoder().encode(e.innerHTML);
      const digest = await crypto.subtle.digest("SHA-1", bytes);
      return `${bytes.length} bytes, sha1 ${[...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
    });
  }

  /* ---- the clock ---- */

  now() {
    return this.page.evaluate(() => Date.now());
  }

  /** Hold the page's time still. Time is running while this is asked, so the instant to stop at has to be a
   *  little ahead of "now"; each retry leaves more room. */
  async pause() {
    if (this.paused) return;
    for (const room of [60, 500, 5000]) {
      try {
        await this.page.clock.pauseAt((await this.now()) + room);
        this.paused = true;
        return;
      } catch (e) {
        if (!/past/.test(e.message)) throw e;
      }
    }
    throw new Error("could not pause the page's clock");
  }

  async resume() {
    if (!this.paused) return;
    await this.page.clock.resume();
    this.paused = false;
  }

  /** Let `ms` of the page's time pass at once, firing every timer due in it. */
  async advance(ms) {
    await this.page.clock.runFor(ms);
  }

  /** Close the lid for `ms`: time jumps, and each timer that came due fires once. */
  async jump(ms) {
    await this.page.clock.fastForward(ms);
  }

  /** The tab goes to the background (true) or comes back (false). */
  hidden(hidden) {
    return this.page.evaluate((h) => window.__setHidden(h), hidden);
  }

  /** The page's own `pagehide`, as iOS fires it before discarding a tab. */
  pagehide() {
    return this.page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  }

  /* ---- the network ---- */

  /** Wait until nothing is in flight, here or in the page, and the page has had time to act on the answers
   *  (a few trips round its event loop, which a held clock does not stop). */
  async settle() {
    let quiet = 0;
    for (let i = 0; i < 800 && quiet < 3; i++) {
      const idle = this.net.inflight === 0 && (await this.page.evaluate(() => window.__pendingFetch)) === 0;
      quiet = idle ? quiet + 1 : 0;
      if (quiet < 3) await new Promise((r) => setTimeout(r, idle ? 5 : 15));
    }
    await this.page.evaluate(async () => {
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => {
          const c = new MessageChannel();
          c.port1.onmessage = () => r();
          c.port2.postMessage(0);
        });
      }
    });
  }

  /** Hold the clock and let the page's polls happen one interval at a time until `cond()` holds. Returns the
   *  number of intervals that took (0: it held already), or -1 if `max` were not enough. Every step waits for the
   *  answers to land first, so the count does not depend on how fast the Worker is. */
  async pump(cond, { step = 2500, max = 8 } = {}) {
    await this.pause();
    for (let i = 0; i < max; i++) {
      await this.settle();
      if (await cond()) return i;
      await this.advance(step);
    }
    await this.settle();
    return (await cond()) ? max : -1;
  }

  /* ---- screenshots ---- */

  /** A screenshot named NN-<name>-<desktop|phone>-<light|dark>.png, with the clock held still while it is taken, and
   *  the style digest of the page (or the element) at that moment, recorded in an assertion's name.
   *  `tall`: the whole page, by growing the window to the page's height for the shot (a full-page capture would
   *  leave the fixed tab bar floating mid-page). `locator`: just that element. `bottom`: scrolled to the end of the
   *  page first (where the Sync panel is), so the shot does not depend on where the last click left the scroll.
   *  `hide`: the CSS that keeps the transient layers (toasts, confetti) out of the picture; a suite whose subject is
   *  those layers passes its own. */
  async shot(name, { locator = null, tall = false, bottom = false, hide = HIDE_CSS } = {}) {
    const page = this.page;
    const vp = page.viewportSize();
    if (tall) {
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.setViewportSize({ width: vp.width, height: Math.max(vp.height, h) });
    }
    try {
      await page.evaluate(() => document.fonts.ready);
      if (bottom) await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
      const wasRunning = !this.paused;
      if (wasRunning) {
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
        await this.pause();
      }
      try {
        if (!this.phone) await page.mouse.move(640, 3);
        const file = `${this.s.no}-${name}-${this.form}-${this.theme}.png`;
        this.s.ok(`styles at ${file}: ${await this.styles(locator ?? "body")}`, true);
        const options = { animations: "disabled", caret: "hide", style: hide + (this.phone ? HIDE_SCROLLBARS : "") };
        /* An element's own screenshot waits for the element to be stable by counting animation frames, which a held clock
           never delivers; the page is captured instead, clipped to the element's box. */
        const target = page;
        const clip = locator ? await locator.boundingBox() : null;
        if (clip) {
          options.clip = clip;
        }
        /* A capture of the page with everything hidden, thrown away, so that the one kept is drawn from scratch. Chromium
           repaints only what changed since the last frame, and under CPU load (WS_JOBS) the antialiased edge of an icon
           that was repainted that way came out a few levels different from one that was painted whole. */
        await target.screenshot({ ...options, style: "html { visibility: hidden !important }" });
        await target.screenshot({ ...options, path: path.join(OUT, file) });
        if (!this.s.screenshots.includes(file)) this.s.screenshots.push(file);
      } finally {
        if (wasRunning) await this.resume();
      }
    } finally {
      if (tall) await page.setViewportSize(vp);
    }
  }

  async setDark(dark) {
    this.theme = dark ? "dark" : "light";
    await this.page.emulateMedia({ colorScheme: dark ? "dark" : "light" });
  }

  async close() {
    await this.ctx.close().catch(() => {});
  }
}

/* ------------------------------ a scenario ------------------------------ */

export class MeScenario extends Scenario {
  defaultTimeout = 6000;

  constructor(id, title) {
    super(id, title);
    /** "03": the scenario's number, which keys its screenshots and the sync codes its devices mint. */
    this.no = id.slice(0, 2);
    this.devices = [];
    this.browsers = [];
    this.dirs = [];
    this.finished = false;
  }

  /** Record what a surface looks like to CSS as part of an assertion's *name*: it passes by itself, and a run that
   *  differs from another in it shows up in ws-diff as an assertion that exists on one side only. (A hash written into
   *  the suite as the expected value would only be true on the machine that wrote it.) */
  async styled(device, label, selector) {
    return this.ok(`styles of ${label}: ${await device.styles(selector)}`, true);
  }

  /** The same for markup, for the surfaces whose markup has to stay put. */
  async marked(device, label, selector) {
    return this.ok(`markup of ${label}: ${await device.markup(selector)}`, true);
  }

  /** A scratch directory, removed when the scenario is over (a camera clip is a few MB). */
  tmp() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "me-regress-"));
    this.dirs.push(dir);
    return dir;
  }

  /** Open a device. Options: name, phone, se (375x667), dark, motion (animations on), seed (the progress
   *  blob in localStorage), syncCfg, storage ({key: raw}), clockOffset (ms), clipboard (false: not
   *  granted), clipboardStub (denied | throws | absent), noStorage, camera ({mode, detector, foreignOnce}), browser. */
  device(o = {}) {
    return Device.create(this, o);
  }

  /** A second browser, for a camera scenario: Chromium takes its fake-camera flags at launch. */
  async launch(args) {
    const b = await chromium.launch({ ...launchOptions(), args });
    this.browsers.push(b);
    return b;
  }

  async dispose() {
    if (!this.finished || this.assertions.some((a) => !a.ok)) {
      for (const d of this.devices) {
        await d.page?.screenshot({ path: path.join(OUT, "failures", `${this.id}-${d.name}.png`), timeout: 5000 }).catch(() => {});
      }
    }
    for (const d of this.devices) await d.close();
    for (const b of this.browsers) await b.close().catch(() => {});
    for (const d of this.dirs) fs.rmSync(d, { recursive: true, force: true });
  }
}

/** A scenario's final assertion: nothing threw inside any of its pages. */
export function finish(s) {
  s.finished = true;
  s.ok("no uncaught errors in the page", s.pageErrors.length === 0, s.pageErrors.join(" | "));
}

