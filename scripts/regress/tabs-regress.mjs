// tabs-regress.mjs <base-url> <out-dir>
//
// Behaviour + pixel regression suite for the study tabs (Line, Metro, Dojo), the app shell (header, tab bar) and
// the celebrations (toasts, confetti): the transit rail and its day cards, checking and unchecking problems and
// every celebration that follows, the mock clock, the line picker, the departures board and a metro run from
// the first card to the result, the dojo's templates and ritual log, touch targets, and the stacking order.
// One fresh browser context per device, every scenario records assertions and screenshots.
//
//   <out-dir>/results.json     { scenario: { assertions: [{name, ok, detail?}], screenshots: [...], ... } }
//   <out-dir>/NN-*.png         the screenshots: NN-<what>-<desktop|phone>-<light|dark>.png
//   <out-dir>/failures/*.png   the last frame of every device of a scenario that failed or threw
//
// Env: WS_JOBS=3   run three scenarios at a time (they share nothing)
//      WS_ONLY=03,06   run only scenarios whose id starts with these
//
// The scenarios live in tabs-<area>.mjs; tabs-kit.mjs holds the readers and the models they are checked against,
// tabs-lib.mjs the device (seeded Math.random, celebration ids and lifetimes), me-lib.mjs everything below that
// (fixed origin, clock control, screenshots with a computed-style digest). Three kinds of assertion record what
// they saw in their *name* rather than in an expected value, and always pass: "styles at <screenshot>: <digest>"
// (the computed styles and boxes of the page at the moment of each screenshot, twice over: two property lists),
// "markup of <surface>: <hash>" (the surfaces whose markup has to stay put), and "<label>: <value>" for a single
// computed value or measurement (see TabsScenario.pin). ws-diff reports one that differs between two runs as an
// assertion that exists on one side only.
//
// A run needs no Worker beyond serving the page: nothing here reads or writes /api. Exit status 1 when any
// assertion fails.

import { chromium } from "playwright";
import { runSuite } from "./harness.mjs";
import { configure, launchOptions } from "./me-lib.mjs";
import { TabsScenario } from "./tabs-lib.mjs";

import shell from "./tabs-shell.mjs";
import line from "./tabs-line.mjs";
import check from "./tabs-check.mjs";
import picker from "./tabs-picker.mjs";
import timer from "./tabs-timer.mjs";
import metro from "./tabs-metro.mjs";
import dojo from "./tabs-dojo.mjs";
import fx from "./tabs-fx.mjs";
import phone from "./tabs-phone.mjs";
import states from "./tabs-states.mjs";

const [BASE, OUT] = process.argv.slice(2);
if (!BASE || !OUT) {
  console.error("usage: node tabs-regress.mjs <base-url> <out-dir>");
  process.exit(2);
}

const scenarios = [];
const scenario = (id, title, fn, opts = {}) => scenarios.push({ id, title, fn, serial: !!opts.serial });

for (const register of [shell, line, check, picker, timer, metro, dojo, fx, phone, states]) register(scenario);

let browser;
runSuite({
  out: OUT,
  scenarios,
  makeScenario: (sc) => new TabsScenario(sc.id, sc.title),
  setup: async () => {
    browser = await chromium.launch(launchOptions());
    configure({ base: BASE, out: OUT, browser });
  },
  teardown: () => browser.close(),
})
  .then((status) => process.exit(status))
  .catch((e) => {
    console.error("tabs-regress crashed:", e);
    process.exit(2);
  });
