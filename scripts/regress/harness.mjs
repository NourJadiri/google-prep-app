// harness.mjs: what the regression suites (ws-regress.mjs, me-regress.mjs) share.
//
//   Scenario    assertion bookkeeping: ok(), and expect(), which polls a getter until
//               it matches (an equal value, a regexp or a predicate)
//   runSuite    the driver: runs the scenarios one at a time, or WS_JOBS at once, and
//               writes <out>/results.json and <out>/summary.txt
//
// Env: WS_JOBS=3    run the scenarios three at a time
//      WS_ONLY=03,06  run only scenarios whose id starts with one of these
//
// results.json is { scenario: { title, ms, assertions: [{name, ok, detail?}], screenshots, ... } },
// which is what ws-diff.py compares.

import fs from "node:fs";
import path from "node:path";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const show = (v) => JSON.stringify(v);
export const canon = (v) =>
  Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v;
export const isEqual = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

export class Scenario {
  /** How long expect() keeps polling before it fails; a suite with slower steps raises it. */
  defaultTimeout = 1500;

  constructor(id, title) {
    this.id = id;
    this.title = title;
    this.assertions = [];
    this.screenshots = [];
    this.pageErrors = [];
    this.consoleErrors = [];
    this.dialogs = [];
    this.acceptDialogs = false;
    this.names = new Map();
    this.ms = 0;
  }

  uniq(name) {
    const n = (this.names.get(name) ?? 0) + 1;
    this.names.set(name, n);
    return n === 1 ? name : `${name} #${n}`;
  }

  ok(name, pass, detail) {
    const a = { name: this.uniq(name), ok: !!pass };
    if (!pass && detail !== undefined) a.detail = String(detail);
    this.assertions.push(a);
    return !!pass;
  }

  /* Poll `getter` until it matches (equal value, regexp, or predicate). */
  async expect(name, getter, expected, { timeout = this.defaultTimeout } = {}) {
    const match =
      typeof expected === "function"
        ? expected
        : expected instanceof RegExp
          ? (v) => typeof v === "string" && expected.test(v)
          : (v) => isEqual(v, expected);
    const t0 = Date.now();
    let value;
    let err = null;
    for (;;) {
      try {
        value = await getter();
        err = null;
        if (match(value)) return this.ok(name, true);
      } catch (e) {
        err = e;
      }
      if (timeout <= 0 || Date.now() - t0 > timeout) break;
      await sleep(60);
    }
    const want = typeof expected === "function" ? "predicate" : expected instanceof RegExp ? String(expected) : show(expected);
    return this.ok(name, false, err ? `threw: ${err.message.split("\n")[0]}` : `got ${show(value)}, expected ${want}`);
  }

  /** Called once the scenario is over, whether it passed, failed or threw: close what it opened. */
  async dispose() {}

  toJSON() {
    return {
      title: this.title,
      ms: this.ms,
      assertions: this.assertions,
      screenshots: this.screenshots,
      consoleErrors: this.consoleErrors,
      dialogs: this.dialogs,
    };
  }
}

/* Runs `scenarios` ({ id, title, fn, serial }) and returns the exit status: 1 when any
 * assertion failed. `makeScenario(sc)` builds the Scenario each fn is handed; `setup()` and
 * `teardown()` open and close whatever the suite shares (the browser). Scenarios run one at a
 * time unless WS_JOBS > 1; the `serial` ones (they read a log nothing else may write to) run
 * alone, last. */
export async function runSuite({ out, scenarios, makeScenario = (sc) => new Scenario(sc.id, sc.title), setup, teardown }) {
  fs.mkdirSync(path.join(out, "failures"), { recursive: true });
  const summary = path.join(out, "summary.txt");
  fs.writeFileSync(summary, "");
  const say = (text) => {
    console.log(text);
    fs.appendFileSync(summary, text + "\n");
  };
  const only = process.env.WS_ONLY ? process.env.WS_ONLY.split(",") : null;
  const jobs = Math.max(1, Number(process.env.WS_JOBS || 1));
  const results = {};
  let failed = 0;
  let total = 0;
  const t0 = Date.now();

  await setup?.();
  const todo = scenarios.filter((sc) => !only || only.some((p) => sc.id.startsWith(p)));

  const runOne = async (sc) => {
    const s = makeScenario(sc);
    const t1 = Date.now();
    try {
      await sc.fn(s);
    } catch (e) {
      s.ok("scenario ran to the end without throwing", false, (e && e.stack ? e.stack : String(e)).split("\n").slice(0, 4).join(" / "));
    } finally {
      await s.dispose().catch(() => {});
    }
    s.ms = Date.now() - t1;
    results[sc.id] = s;
    const bad = s.assertions.filter((a) => !a.ok);
    total += s.assertions.length;
    failed += bad.length;
    const lines = [`${bad.length ? "FAIL" : "PASS"}  ${sc.id.padEnd(22)} ${String(s.assertions.length - bad.length).padStart(3)}/${s.assertions.length} assertions  ${s.screenshots.length} screenshots  ${(s.ms / 1000).toFixed(1)}s  ${sc.title}`];
    for (const a of bad) lines.push(`        x ${a.name}${a.detail ? "\n            " + a.detail.slice(0, 600) : ""}`);
    if (s.consoleErrors.length) lines.push(`        (console errors: ${s.consoleErrors.length}, e.g. ${s.consoleErrors[0]})`);
    say(lines.join("\n"));
  };

  const pool = todo.filter((sc) => !sc.serial);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(jobs, pool.length || 1) }, async () => {
      while (next < pool.length) await runOne(pool[next++]);
    })
  );
  for (const sc of todo.filter((x) => x.serial)) await runOne(sc);

  await teardown?.();
  const ordered = Object.fromEntries(Object.keys(results).sort().map((k) => [k, results[k]]));
  fs.writeFileSync(path.join(out, "results.json"), JSON.stringify(ordered, null, 2) + "\n");
  const nPass = Object.values(results).filter((r) => r.assertions.every((a) => a.ok)).length;
  say(`\n${nPass}/${Object.keys(results).length} scenarios passed, ${total - failed}/${total} assertions, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  return failed ? 1 : 0;
}
