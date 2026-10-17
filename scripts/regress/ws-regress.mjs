// ws-regress.mjs <base-url> <out-dir>
//
// Behaviour + pixel regression suite for the workspace (problem pane, editor,
// console, Python runner, stopwatch, splits, assistant). One fresh browser
// context per scenario; every scenario records assertions and screenshots.
//
//   <out-dir>/results.json     { scenario: { assertions: [{name, ok, detail?}], screenshots: [...], ... } }
//   <out-dir>/NN-*.png         the screenshots (deterministic: see shot())
//   <out-dir>/failures/*.png   only when a scenario blew up half way
//
// Env: WS_MOCK_LOG=<file>  the mock Anthropic's request log (enables the
//                          "what the model was sent" assertions)
//      WS_ONLY=03,06       run only scenarios whose id starts with these
//
// Exit status 1 when any assertion fails.

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { Scenario, runSuite, sleep, isEqual } from "./harness.mjs";

const [BASE, OUT] = process.argv.slice(2);
if (!BASE || !OUT) {
  console.error("usage: node ws-regress.mjs <base-url> <out-dir>");
  process.exit(2);
}
const MOCK_LOG = process.env.WS_MOCK_LOG || null;

/* ------------------------------ the problem ------------------------------ */

const TITLE = "All Paths From Source to Target";
const PID = "ap"; // the problem's id in the plan (drafts are keyed by it)
const STARTER =
  "class Solution:\n    def allPathsSourceTarget(self, graph: List[List[int]]) -> List[List[int]]:\n        pass\n";
const CASE1 = "[[1,2,3],[4],[1,4],[4],[]]";
const CASE2 = "[[1,2],[],[1]]";
const CASE3 = "[[1],[],[1]]";
const EXPECTED1 = "[[0,1,4],[0,2,1,4],[0,2,4],[0,3,4]]";
const N_TESTS = 23; // spec.json: every test, hidden ones included

const CORRECT = `class Solution:
    def allPathsSourceTarget(self, graph: List[List[int]]) -> List[List[int]]:
        target = len(graph) - 1
        paths = []

        def dfs(node, path):
            if node == target:
                paths.append(path[:])
                return
            for nxt in graph[node]:
                path.append(nxt)
                dfs(nxt, path)
                path.pop()

        dfs(0, [0])
        return paths
`;
const WRONG = `class Solution:
    def allPathsSourceTarget(self, graph: List[List[int]]) -> List[List[int]]:
        return []
`;
const LOOP = `class Solution:
    def allPathsSourceTarget(self, graph: List[List[int]]) -> List[List[int]]:
        while True:
            pass
`;
const RUNTIME_ERR = `class Solution:
    def allPathsSourceTarget(self, graph):
        n = len(graph)
        return undefined_name(graph)
`;
const SYNTAX_ERR = `class Solution:
    def allPathsSourceTarget(self, graph)
        return []
`;
const PRINTS = `class Solution:
    def allPathsSourceTarget(self, graph):
        print("hello from the solution")
        return []
`;

/* ------------------------------ plumbing ------------------------------ */

const DESKTOP = { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 };
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

/* Everything volatile is hidden or masked in screenshots:
 *  .ws-ms        the per-case timing label (width varies with the digits)
 *  .toasts, .cf  toasts and confetti (they come and go on a timer)
 *  .cm-cursorLayer  CodeMirror's blinking caret: the layer has no box of its own
 *                (contain: size), so a mask would be empty; hiding it is what works
 *  .wclock-time  the stopwatch is masked (monospace, so its box never changes size)
 * and inside shot(), "N ms" in a verdict line is rewritten to "0 ms" and put back. */
const HIDE_CSS = `
  .ws-ms, .toasts, .cf { visibility: hidden !important; }
  .cm-cursorLayer { visibility: hidden !important; }
`;

const INIT_SCRIPT = () => {
  /* Counts the moments a run starts: the console shows "Starting Python…" /
     "Running case n of m…" (.ws-running) from the moment a run begins until it
     has an outcome. React reuses the node between the result and the running
     state, so a class change counts as well as an added node. DOM only: no
     knowledge of the runner's internals. */
  window.__wsRuns = 0;
  const running = (c) => /(^|\s)ws-running(\s|$)/.test(c || "");
  new MutationObserver((records) => {
    records.forEach((r, i) => {
      if (r.type === "childList") {
        r.addedNodes.forEach((n) => {
          if (n.nodeType === 1 && (n.classList.contains("ws-running") || n.querySelector(".ws-running"))) window.__wsRuns++;
        });
      } else if (r.type === "attributes") {
        const next = records.slice(i + 1).find((x) => x.type === "attributes" && x.target === r.target);
        const now = next ? next.oldValue : r.target.getAttribute("class");
        if (running(now) && !running(r.oldValue)) window.__wsRuns++;
      }
    });
  }).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"], attributeOldValue: true });
};

let browser;

class WsScenario extends Scenario {
  /* Screenshot of the page (or a locator), deterministic. */
  async shot(page, name, { locator = null, hover = true, runner = true } = {}) {
    await settle(page, runner);
    if (hover && !PHONE_MODE.has(page)) await page.mouse.move(640, 3);
    const file = `${this.id.slice(0, 2)}-${name}.png`;
    // Rewrite "123 ms" in the verdict line to "0 ms" in place (the text node
    // stays, so React is none the wiser), and restore it afterwards.
    await page.evaluate(() => {
      window.__wsRestore = [];
      document.querySelectorAll(".ws-verdict span, .ws-ms").forEach((el) => {
        const t = el.firstChild;
        if (t && t.nodeType === 3 && /\d+ ms/.test(t.nodeValue)) {
          window.__wsRestore.push([t, t.nodeValue]);
          t.nodeValue = t.nodeValue.replace(/\d+ ms/, "0 ms");
        }
      });
    });
    try {
      await (locator ?? page).screenshot({
        path: path.join(OUT, file),
        animations: "disabled",
        caret: "hide",
        style: HIDE_CSS,
        mask: [page.locator(".wclock-time")],
        maskColor: "#ff00ff",
      });
    } finally {
      await page.evaluate(() => {
        (window.__wsRestore || []).forEach(([t, v]) => (t.nodeValue = v));
        window.__wsRestore = [];
      });
    }
    if (!this.screenshots.includes(file)) this.screenshots.push(file);
  }
}

const PHONE_MODE = new WeakSet();

/* Wait until what is on screen can't change by itself: fonts in, two frames
   painted, and the Python runner idle and Ready (never mid-load, never busy). */
async function settle(page, runner = true) {
  if (runner && (await page.locator(".ws-runner").count())) {
    await page.locator(".ws-runner.ready").waitFor({ state: "attached", timeout: 90_000 });
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

async function newPage(s, opts = {}) {
  const { phone = false, dark = false, permissions = [], storage = null } = opts;
  const ctx = await browser.newContext({
    ...(phone ? PHONE : DESKTOP),
    colorScheme: dark ? "dark" : "light",
    reducedMotion: "reduce",
    locale: "en-US",
    timezoneId: "UTC",
    permissions,
  });
  await ctx.addInitScript(INIT_SCRIPT);
  if (storage) {
    // Per-origin pre-seeding that runs before the app does, once per document.
    await ctx.addInitScript((kv) => {
      for (const [k, v] of Object.entries(kv)) if (localStorage.getItem(k) === null) localStorage.setItem(k, v);
    }, storage);
  }
  const page = await ctx.newPage();
  if (phone) PHONE_MODE.add(page);
  page.setDefaultTimeout(20_000);
  page.on("pageerror", (e) => s.pageErrors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") s.consoleErrors.push(m.text().slice(0, 300));
  });
  page.on("dialog", async (d) => {
    s.dialogs.push(`${d.type()}: ${d.message()}`);
    if (s.acceptDialogs) await d.accept();
    else await d.dismiss();
  });
  // A scenario that fails or throws leaves its last frame in failures/ (ws-diff only compares the top level).
  const close = ctx.close.bind(ctx);
  ctx.close = async () => {
    if (!s.finished || s.assertions.some((a) => !a.ok)) {
      await page.screenshot({ path: path.join(OUT, "failures", `${s.id}.png`), timeout: 5000 }).catch(() => {});
    }
    await close();
  };
  return { ctx, page };
}

/* ------------------------------ page helpers ------------------------------ */

const press = (page, loc) => (PHONE_MODE.has(page) ? loc.tap() : loc.click());

const sel = {
  openBtn: 'button[title="Open in the editor"]',
  run: 'button[title^="Run the cases"]',
  submit: 'button[title^="Run every test"]',
  stop: '.ws-actions button[title="Stop"]',
  ask: 'button[title^="Ask the assistant"]',
  copy: 'button[title^="Problem, code and last result"]',
  back: 'button[aria-label="Back to the line"]',
  code: 'section[aria-label="Code"]',
  editorContent: 'section[aria-label="Code"] .cm-content',
  tests: 'section[aria-label="Tests"]',
  problem: 'section[aria-label="Problem"]',
  panel: '[aria-label="Assistant"]',
  dialog: `[role=dialog][aria-label="${TITLE}"]`,
};

const runnerPhase = (page) => page.locator(".ws-runner").getAttribute("class").then((c) => c.replace("ws-runner", "").trim());
const waitReady = (page) => page.locator(".ws-runner.ready").waitFor({ state: "attached", timeout: 90_000 });

/* Open the workspace from the Line tab. Returns once the editor is up and
   Python has loaded. */
async function openWorkspace(s, page, { check = true } = {}) {
  await page.goto(BASE);
  await press(page, page.getByRole("navigation", { name: "Sections" }).getByRole("button", { name: "Line" }));
  const btn = page.locator(sel.openBtn).first();
  await btn.waitFor();
  if (check) await s.expect("the first in-app problem on the Line is " + TITLE, () => btn.getAttribute("aria-label"), `Solve ${TITLE} in the editor`);
  await press(page, btn);
  await page.locator(sel.dialog).waitFor();
  await page.locator(sel.editorContent).first().waitFor({ state: "attached" });
  await waitReady(page);
}

async function codeOf(page, where = sel.code) {
  return page.locator(`${where} .cm-line`).evaluateAll((els) => els.map((e) => e.textContent).join("\n"));
}

async function setCode(page, code) {
  const ed = page.locator(sel.editorContent);
  await ed.click();
  await page.keyboard.press("Control+a");
  await page.keyboard.insertText(code);
}

const draftOf = (page) =>
  page.evaluate((pid) => {
    try {
      return JSON.parse(localStorage.getItem("onsite-express-code-v1") || "{}")[pid]?.code ?? null;
    } catch {
      return "<unreadable>";
    }
  }, PID);

const prefsOf = (page) =>
  page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem("onsite-express-workspace-v1") || "null");
    } catch {
      return "<unreadable>";
    }
  });

const runsStarted = (page) => page.evaluate(() => window.__wsRuns);

/* Start a run (or a submit) and wait for its outcome. `how`:
 *   button | submit-button | kbd-editor | kbd-window | submit-kbd-editor | submit-kbd-window */
async function startRun(s, page, how, { timeout = 60_000 } = {}) {
  const before = await runsStarted(page);
  switch (how) {
    case "button":
      await press(page, page.locator(sel.run));
      break;
    case "submit-button":
      await press(page, page.locator(sel.submit));
      break;
    case "kbd-editor":
    case "submit-kbd-editor":
      await page.locator(sel.editorContent).click();
      await page.keyboard.press(how.startsWith("submit") ? "Control+Shift+Enter" : "Control+Enter");
      break;
    case "kbd-window":
    case "submit-kbd-window":
      await page.locator(".ws-title h2").click(); // focus leaves the editor
      await page.keyboard.press(how.startsWith("submit") ? "Control+Shift+Enter" : "Control+Enter");
      break;
    default:
      throw new Error("unknown run trigger " + how);
  }
  await page.waitForFunction((n) => window.__wsRuns > n, before, { timeout: 15_000 });
  await page.locator(".ws-verdict").waitFor({ state: "attached", timeout });
  await page.locator(sel.run).waitFor({ state: "visible", timeout });
  return runsStarted(page).then((n) => n - before);
}

const verdictOf = async (page) => ({
  tone: ((await page.locator(".ws-verdict").getAttribute("class")) || "").replace("ws-verdict", "").trim(),
  title: await page.locator(".ws-verdict strong").textContent(),
  detail: await page.locator(".ws-verdict span").textContent(),
});

const chipsOf = (page) =>
  page.locator('.ws-results [aria-label="Cases"] [role=tab]').evaluateAll((els) =>
    els.map((e) => ({
      text: e.textContent,
      tone: ["ok", "bad", "warn", "info", "idle"].find((t) => e.classList.contains(t)) || "?",
      on: e.getAttribute("aria-selected") === "true",
      title: e.title,
    }))
  );

const detailOf = (page) =>
  page.locator(".ws-detail").evaluate((el) => ({
    badge: el.querySelector(".ws-badge")?.textContent ?? null,
    title: el.querySelector(".ws-detail-title")?.textContent ?? null,
    blocks: Object.fromEntries(
      [...el.querySelectorAll(".ws-block")].map((b) => [b.querySelector(".ws-block-title").textContent, [...b.querySelectorAll("pre")].map((p) => p.textContent)])
    ),
    notes: [...el.querySelectorAll(".ws-note")].map((n) => n.textContent),
    errors: [...el.querySelectorAll(".ws-error-msg")].map((n) => n.textContent),
  }));

const caseChips = (page) =>
  page.locator(".ws-cases .ws-chip:not(.add)").evaluateAll((els) =>
    els.map((e) => ({
      text: e.querySelector("button")?.textContent ?? e.textContent,
      on: e.classList.contains("on"),
      edited: !!e.querySelector(".ws-edited"),
      hasRemove: !!e.querySelector(".ws-chip-x"),
    }))
  );

/* The numbers CodeMirror's gutter shows (it also keeps a hidden element sized for the widest number). */
const gutterNumbers = (page) =>
  page.locator(`${sel.code} .cm-lineNumbers .cm-gutterElement`).evaluateAll((els) =>
    els.filter((e) => getComputedStyle(e).visibility !== "hidden" && /^\d+$/.test(e.textContent)).map((e) => e.textContent)
  );

const caseNames = async (page) => (await caseChips(page)).map((c) => c.text);
const consoleTab = (page) =>
  page.locator(`${sel.tests} [role=tab][aria-selected=true]`).first().textContent().then((t) => t.trim());

async function dark(page) {
  await page.emulateMedia({ colorScheme: "dark" });
}

/* A scenario's final assertion: nothing threw inside the page. */
function finish(s) {
  s.finished = true;
  s.ok("no uncaught errors in the page", s.pageErrors.length === 0, s.pageErrors.join(" | "));
}

/* ------------------------------ scenarios ------------------------------ */

const scenarios = [];
const scenario = (id, title, fn, { serial = false } = {}) => scenarios.push({ id, title, fn, serial });

/* 1 ------------------------------------------------------------------ */
scenario("01-open", "open the workspace from the Line tab", async (s) => {
  const { ctx, page } = await newPage(s);
  try {
    await page.goto(BASE);
    const line = page.getByRole("navigation", { name: "Sections" }).getByRole("button", { name: "Line" });
    await line.click();
    await s.expect("the Line tab is the current section", () => line.getAttribute("aria-current"), "page");
    await s.expect("no workspace is open before the click", () => page.locator('[role=dialog][aria-modal=true]').count(), 0);
    const btn = page.locator(sel.openBtn).first();
    await s.expect("the first in-app problem on the Line is " + TITLE, () => btn.getAttribute("aria-label"), `Solve ${TITLE} in the editor`);
    await btn.click();
    await page.locator(sel.dialog).waitFor();
    await waitReady(page);

    await s.expect("modal dialog labelled with the problem title", () => page.locator(sel.dialog).getAttribute("aria-modal"), "true");
    await s.expect("header h2 is the problem title", () => page.locator(".ws-title h2").textContent(), TITLE);
    await s.expect("header shows the difficulty, line bullet, station and LeetCode link", () =>
      page.locator(".ws-meta").evaluate((el) => ({
        diff: el.querySelector(".diff")?.textContent,
        bullet: el.querySelector(".ws-bullet")?.textContent,
        tag: el.querySelector(".tag")?.textContent,
        lc: el.querySelector("a.ws-lc")?.textContent,
        href: el.querySelector("a.ws-lc")?.getAttribute("href"),
        done: !!el.querySelector(".ws-done"),
      })),
      { diff: "MED", bullet: "G", tag: "Day 1 · Pathfinding", lc: "LC 797", href: "https://leetcode.com/problems/all-paths-from-source-to-target/", done: false });
    await s.expect("header actions: Ask, Copy for Claude, Run, Submit (+ stopwatch)", () => page.locator(".ws-actions button").evaluateAll((els) => els.map((e) => e.textContent.trim()).filter((t) => t && !/^\d\d:\d\d$/.test(t))), ["Ask", "Copy for Claude", "Run", "Submit"]);
    await s.expect("the stopwatch is running", () => page.locator(".wclock-time").getAttribute("aria-label"), "Pause the clock");
    await s.expect("page behind the workspace does not scroll (body overflow hidden)", () => page.evaluate(() => document.body.style.overflow), "hidden");
    await s.expect("focus moved into the dialog", () => page.evaluate(() => document.activeElement?.getAttribute("role")), "dialog");

    // problem pane
    await s.expect("problem pane tabs: Description (selected), Solution", () =>
      page.locator(`${sel.problem} .ws-tabs [role=tab]`).evaluateAll((els) => els.map((e) => e.textContent.trim() + ":" + e.getAttribute("aria-selected"))),
      ["Description:true", "Solution:false"]);
    await s.expect("topic chips", () => page.locator(".ws-topic").allTextContents(), ["graph", "dfs", "backtracking"]);
    await s.expect("statement sections", () => page.locator(".ws-sec .ws-h").allTextContents(), ["The task", "Examples", "Constraints"]);
    await s.expect("two disclosures, both closed", () => page.locator("details.ws-hintbox").evaluateAll((els) => els.map((e) => e.querySelector("summary").textContent.trim() + ":" + e.open)),
      ["Hint — what to aim for:false", "Follow-ups an interviewer might ask:false"]);

    // editor
    await s.expect("exactly one editor, holding the starter code", async () => ({ n: await page.locator(".cm-editor").count(), code: await codeOf(page) }), { n: 1, code: STARTER });
    await s.expect("the line-number gutter counts the four lines of the starter", () => gutterNumbers(page), ["1", "2", "3", "4"]);
    await s.expect("the editor is labelled 'Your solution to …'", () => page.locator(sel.editorContent).getAttribute("aria-label"), `Your solution to ${TITLE}`);
    await s.expect("toolbar: Python 3.14, runner Ready, 14px", () => page.locator(".ws-toolbar").evaluate((el) => ({ lang: el.querySelector(".ws-lang").textContent, runner: el.querySelector(".ws-runner").textContent, font: el.querySelector(".ws-font").textContent })),
      { lang: "Python 3.14", runner: "Ready", font: "14px" });

    // console
    await s.expect("console is the 'Tests' section with Testcase (selected) and Result tabs", () =>
      page.locator(`${sel.tests} .ws-tabs [role=tab]`).evaluateAll((els) => els.map((e) => e.textContent.trim() + ":" + e.getAttribute("aria-selected"))),
      ["Testcase:true", "Result:false"]);
    await s.expect("three example cases, Case 1 active", async () => (await caseChips(page)).map((c) => c.text + (c.on ? "*" : "")), ["Case 1*", "Case 2", "Case 3"]);
    await s.expect("Case 1 field: graph = the first example", () => page.locator(".ws-field").evaluateAll((els) => els.map((e) => e.querySelector("span").textContent + e.querySelector("textarea").value)), ["graph =" + CASE1]);
    await s.expect("the editor starts un-flagged: no error line", () => page.locator(".cm-errline").count(), 0);
    await s.shot(page, "open-desktop-light");

    await page.getByRole("tab", { name: "Result" }).click();
    await s.expect("Result tab before any run: the empty hint with shortcuts", () => page.locator(".ws-empty").innerText(), /Run tries the cases[\s\S]*Ctrl\s*↵\s*run · Ctrl\s*⇧\s*↵\s*submit/);
    await s.shot(page, "open-result-empty-desktop-light");
    await page.getByRole("tab", { name: "Testcase" }).click();

    await dark(page);
    await s.shot(page, "open-desktop-dark");
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 2 ------------------------------------------------------------------ */
scenario("02-problem-pane", "hint disclosures and the veiled reference solution", async (s) => {
  const { ctx, page } = await newPage(s, { permissions: ["clipboard-read", "clipboard-write"] });
  try {
    await openWorkspace(s, page);
    const boxes = page.locator("details.ws-hintbox");
    const open = () => boxes.evaluateAll((els) => els.map((e) => e.open));
    await s.expect("both disclosures start closed", open, [false, false]);

    await boxes.nth(0).locator("summary").click();
    await s.expect("the hint opens (and only it)", open, [true, false]);
    await s.expect("hint body is the 'Aim for' text", () => boxes.nth(0).innerText(), /Depth-first search from node 0, carrying the current path/);
    await boxes.nth(1).locator("summary").click();
    await s.expect("the follow-ups open too", open, [true, true]);
    await s.expect("follow-ups list three questions", () => boxes.nth(1).locator("li").count(), 3);
    await s.expect("follow-ups first bullet", () => boxes.nth(1).locator("li").first().innerText(), /^Only count the paths\./);
    await page.locator(".ws-problem-body").evaluate((el) => (el.scrollTop = el.scrollHeight));
    await s.shot(page, "hints-open-desktop-light");

    await boxes.nth(0).locator("summary").click();
    await s.expect("clicking the hint's summary again closes it", open, [false, true]);
    await boxes.nth(1).locator("summary").click();
    await s.expect("and the follow-ups too", open, [false, false]);

    // the solution tab, veiled
    await page.getByRole("tab", { name: "Solution" }).click();
    await s.expect("Solution tab is selected", () => page.locator(`${sel.problem} [role=tab][aria-selected=true]`).textContent().then((t) => t.trim()), "Solution");
    await s.expect("the veil says 'Try it first.' and offers Reveal", () => page.locator(".ws-veil").innerText(), /Try it first\.[\s\S]*Reveal the solution/);
    await s.expect("no reference editor yet", () => page.locator(".ws-sol-code").count(), 0);
    await s.shot(page, "solution-veil-desktop-light");

    await page.getByRole("button", { name: "Reveal the solution" }).click();
    await s.expect("the veil is gone", () => page.locator(".ws-veil").count(), 0);
    await s.expect("the walkthrough opens with 'Approach'", () => page.locator(".ws-problem-body .md h2").first().textContent(), "Approach");
    await s.expect("a 'Reference solution' heading with a Copy button", () => page.locator(".ws-sol-head").innerText(), /^Reference solution\s+Copy$/i);
    await s.expect("read-only reference editor holds the solution", async () => {
      const t = await codeOf(page, ".ws-sol-code");
      return { dfs: t.includes("def dfs(node):"), ro: await page.locator(".ws-sol-code .cm-content").getAttribute("contenteditable"), wrap: await page.locator(".ws-sol-code .cm-lineWrapping").count() };
    }, { dfs: true, ro: "false", wrap: 1 });
    await s.expect("two editors on the page now (yours and the reference)", () => page.locator(".cm-editor").count(), 2);
    await s.expect("your own editor is untouched", () => codeOf(page, sel.code), STARTER);
    await s.expect("the Solution tab icon is unlocked", () => page.locator(`${sel.problem} .ws-tabs [role=tab]`).nth(1).locator("svg").count(), 1);
    await page.locator(".ws-sol-head .ws-linkbtn").click();
    await s.expect("Copy on the reference solution reads 'Copied'", () => page.locator(".ws-sol-head .ws-linkbtn").innerText(), "Copied");
    await s.expect("the clipboard holds the reference solution", () => page.evaluate(() => navigator.clipboard.readText()), /^class Solution:\n {4}def allPathsSourceTarget/, { timeout: 3000 });
    await s.expect("…and it goes back to 'Copy'", () => page.locator(".ws-sol-head .ws-linkbtn").innerText(), "Copy", { timeout: 4000 });
    await page.locator(".ws-problem-body").evaluate((el) => (el.scrollTop = 0));
    await s.shot(page, "solution-revealed-desktop-light");

    await page.getByRole("tab", { name: "Description" }).click();
    await s.expect("back on Description: statement sections again", () => page.locator(".ws-sec .ws-h").allTextContents(), ["The task", "Examples", "Constraints"]);
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 3 ------------------------------------------------------------------ */
scenario("03-run-correct", "run a correct solution from the button and the keyboard", async (s) => {
  const { ctx, page } = await newPage(s);
  try {
    await openWorkspace(s, page);
    await setCode(page, CORRECT);
    await s.expect("the editor really contains the typed solution", () => codeOf(page), CORRECT);
    await s.expect("…and no auto-closed brackets sneaked in (line count)", () => page.locator(`${sel.code} .cm-line`).count(), CORRECT.split("\n").length);
    await s.expect("the draft is saved after the debounce", () => draftOf(page), CORRECT, { timeout: 3000 });

    const n1 = await startRun(s, page, "button");
    await s.expect("Run button: exactly one run started", () => n1, 1);
    await s.expect("the Result tab is showing", () => consoleTab(page), "Result");
    await s.expect("verdict: Passed, 3 / 3 cases", () => verdictOf(page), { tone: "ok", title: "Passed", detail: "3 / 3 cases passed · Submit runs the full suite" });
    await s.expect("three case chips, all green, Case 1 selected", async () => (await chipsOf(page)).map((c) => `${c.text}:${c.tone}:${c.on}:${c.title}`), ["Case 1:ok:true:Case 1 — Passed", "Case 2:ok:false:Case 2 — Passed", "Case 3:ok:false:Case 3 — Passed"]);
    await s.expect("no 'not run' note", () => page.locator(".ws-notrun").count(), 0);
    const d = await detailOf(page);
    await s.expect("case detail: Passed, Case 1, input / output / expected", () => d, (v) => v.badge === "Passed" && v.title === "Case 1" && isEqual(v.blocks.Input, ["graph = " + CASE1]) && isEqual(v.blocks.Output, [EXPECTED1]) && isEqual(v.blocks.Expected, [EXPECTED1]) && v.notes.length === 0 && v.errors.length === 0);
    await s.expect("Result tab carries a green dot", () => page.locator(`${sel.tests} .ws-tabs .ws-dot`).getAttribute("class"), "ws-dot ok");
    await s.expect("no error band in the editor", () => page.locator(".cm-errline").count(), 0);
    await s.expect("Run is back and Submit enabled", async () => ({ run: await page.locator(sel.run).count(), stop: await page.locator(sel.stop).count(), submit: await page.locator(sel.submit).isEnabled() }), { run: 1, stop: 0, submit: true });
    await s.shot(page, "run-pass-desktop-light");
    await s.shot(page, "run-pass-console-desktop-light", { locator: page.locator(sel.tests) });

    // again, from the keyboard: Testcase tab first, so that a new run shows up as a tab switch too
    await page.getByRole("tab", { name: "Testcase" }).click();
    await s.expect("(setup) on the Testcase tab", () => consoleTab(page), "Testcase");
    const n2 = await startRun(s, page, "kbd-editor");
    await s.expect("Ctrl+Enter in the editor: exactly one new run started", () => n2, 1);
    await s.expect("…and the console jumped to Result", () => consoleTab(page), "Result");
    await s.expect("…and it passed again", () => verdictOf(page), { tone: "ok", title: "Passed", detail: "3 / 3 cases passed · Submit runs the full suite" });

    // and with focus outside the editor (the window-level shortcut)
    await page.getByRole("tab", { name: "Testcase" }).click();
    const n3 = await startRun(s, page, "kbd-window");
    await s.expect("Ctrl+Enter outside the editor: exactly one new run started", () => n3, 1);
    await s.expect("…it passed", () => verdictOf(page).then((v) => v.title), "Passed");
    await s.expect("the code is still the typed solution", () => codeOf(page), CORRECT);
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 4 ------------------------------------------------------------------ */
scenario("04-submit", "submit: accepted, XP and badge toasts, passed on the Line", async (s) => {
  const { ctx, page } = await newPage(s);
  try {
    await openWorkspace(s, page);
    const stats0 = await page.evaluate(() => document.querySelector(".linestats")?.textContent ?? null);
    await setCode(page, CORRECT);
    await s.expect("(setup) the header has no 'passed' mark yet", () => page.locator(".ws-done").count(), 0);

    const n = await startRun(s, page, "submit-button");
    await s.expect("Submit button: exactly one run started", () => n, 1);
    await s.expect("verdict: Accepted, all 23 tests", () => verdictOf(page), (v) => v.tone === "ok" && v.title === "Accepted" && /^All 23 tests passed · \d+ ms$/.test(v.detail));
    await s.expect("23 test chips in a grid, numbered 1..23, all green", async () => {
      const chips = await chipsOf(page);
      return { n: chips.length, nums: chips.map((c) => c.text).join(","), tones: [...new Set(chips.map((c) => c.tone))].join(","), grid: await page.locator(".ws-chips.grid").count() };
    }, { n: N_TESTS, nums: Array.from({ length: N_TESTS }, (_, i) => i + 1).join(","), tones: "ok", grid: 1 });
    await s.expect("first chip's detail is 'Test 1 · example'", () => detailOf(page).then((d) => [d.badge, d.title]), ["Passed", "Test 1 · example"]);
    await s.expect("header gets the 'passed' mark", () => page.locator(".ws-done").textContent(), "passed", { timeout: 3000 });
    await s.expect("toasts: XP, first-problem badge, all-green badge", () => page.locator(".toast").allTextContents(), ["+20 XP · All Paths From Source to…", "Badge — First Blood", "Badge — All Green"], { timeout: 3000 });
    await s.shot(page, "submit-accepted-desktop-light");
    await s.shot(page, "submit-accepted-console-desktop-light", { locator: page.locator(sel.tests) });

    // the solution opens by itself once every test has passed
    await page.getByRole("tab", { name: "Solution" }).click();
    await s.expect("the solution is open without Reveal (no veil, reference editor shown)", async () => ({ veil: await page.locator(".ws-veil").count(), ref: await page.locator(".ws-sol-code .cm-editor").count() }), { veil: 0, ref: 1 });
    await s.shot(page, "solution-after-accept-desktop-light");
    await page.getByRole("tab", { name: "Description" }).click();

    // a second submit (keyboard) re-runs and is accepted again, but awards nothing new
    await s.expect("(setup) first toasts are gone", () => page.locator(".toast").count(), 0, { timeout: 6000 });
    const n2 = await startRun(s, page, "submit-kbd-editor");
    await s.expect("Ctrl+Shift+Enter: exactly one run started", () => n2, 1);
    await s.expect("…accepted again", () => verdictOf(page).then((v) => v.title), "Accepted");
    await sleep(700);
    await s.expect("…with no new toast (nothing re-awarded)", () => page.locator(".toast").count(), 0);
    await s.expect("Ctrl+Shift+Enter ran the full suite, not the cases", async () => (await chipsOf(page)).length, N_TESTS);

    // back on the Line
    await page.locator(sel.back).click();
    await s.expect("closing returns to the Line (no dialog)", () => page.locator(sel.dialog).count(), 0, { timeout: 3000 });
    const row = page.locator(".prow", { has: page.locator(".pname", { hasText: new RegExp("^" + TITLE + "$") }) });
    await s.expect("the problem's row is marked done", () => row.getAttribute("class"), /\bdone\b/);
    await s.expect("…with the 'passed' tag", () => row.locator(".tag.passed").textContent(), "passed");
    await s.expect("…and its check circle pressed", () => row.locator(".pcheck").getAttribute("aria-pressed"), "true");
    await s.expect("the Line's progress counter moved by one", async () => {
      const now = await page.locator(".linestats").textContent();
      const a = Number(/^(\d+) \//.exec(stats0 ?? "")?.[1]);
      const b = Number(/^(\d+) \//.exec(now ?? "")?.[1]);
      return b - a;
    }, 1);

    // reopening shows the 'passed' mark and the solution still open
    await row.locator(sel.openBtn).click();
    await page.locator(sel.dialog).waitFor();
    await s.expect("reopened: header says passed", () => page.locator(".ws-done").textContent(), "passed", { timeout: 3000 });
    await s.expect("reopened: the code is still the submitted solution", () => codeOf(page), CORRECT);
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 5 ------------------------------------------------------------------ */
scenario("05-run-wrong", "a wrong answer: verdict, failing chips, expected vs got", async (s) => {
  const { ctx, page } = await newPage(s);
  try {
    await openWorkspace(s, page);
    await setCode(page, WRONG);
    await startRun(s, page, "button");
    await s.expect("verdict: Wrong Answer, 1 / 3", () => verdictOf(page), { tone: "bad", title: "Wrong Answer", detail: "1 / 3 cases passed" });
    await s.expect("chips: Case 1 and 2 red, Case 3 green; Case 1 selected", async () => (await chipsOf(page)).map((c) => `${c.text}:${c.tone}:${c.on}:${c.title}`),
      ["Case 1:bad:true:Case 1 — Wrong answer", "Case 2:bad:false:Case 2 — Wrong answer", "Case 3:ok:false:Case 3 — Passed"]);
    await s.expect("detail: Wrong answer on Case 1, Output [] vs Expected the four paths", () => detailOf(page), (d) => d.badge === "Wrong answer" && d.title === "Case 1" && isEqual(d.blocks.Input, ["graph = " + CASE1]) && isEqual(d.blocks.Output, ["[]"]) && isEqual(d.blocks.Expected, [EXPECTED1]) && isEqual(d.notes, ["Found 0 of the 4 paths. Missing, for one: [0,1,4]."]));
    await s.expect("the output block is marked bad and the expected one good", () => page.locator(".ws-detail .ws-pre").evaluateAll((els) => els.map((e) => e.className)), ["ws-pre", "ws-pre bad", "ws-pre good"]);
    await s.expect("Result tab carries a red dot", () => page.locator(`${sel.tests} .ws-tabs .ws-dot`).getAttribute("class"), "ws-dot bad");
    await s.shot(page, "run-wrong-desktop-light");
    await dark(page);
    await s.shot(page, "run-wrong-desktop-dark");
    await page.emulateMedia({ colorScheme: "light" });

    await page.locator('.ws-results [aria-label="Cases"] [role=tab]').nth(1).click();
    await s.expect("clicking Case 2 shows its detail: Output [] vs Expected [[0,2]]", () => detailOf(page), (d) => d.title === "Case 2" && isEqual(d.blocks.Output, ["[]"]) && isEqual(d.blocks.Expected, ["[[0,2]]"]) && isEqual(d.blocks.Input, ["graph = " + CASE2]));
    await s.expect("…and Case 2's chip is the selected one", async () => (await chipsOf(page)).map((c) => c.on), [false, true, false]);
    await page.locator('.ws-results [aria-label="Cases"] [role=tab]').nth(2).click();
    await s.expect("clicking Case 3 shows a pass (the empty answer is right there)", () => detailOf(page), (d) => d.badge === "Passed" && d.title === "Case 3" && isEqual(d.blocks.Output, ["[]"]) && isEqual(d.blocks.Expected, ["[]"]));

    // Submit with the same wrong code: not accepted, not marked
    const n = await startRun(s, page, "submit-button");
    await s.expect("Submit with wrong code: one run", () => n, 1);
    await s.expect("verdict: Wrong Answer, k / 23 tests", () => verdictOf(page), (v) => v.tone === "bad" && v.title === "Wrong Answer" && /^\d+ \/ 23 tests passed$/.test(v.detail));
    await s.expect("the chips are the 23 tests and the first one to look at is selected", async () => {
      const chips = await chipsOf(page);
      const firstBad = chips.findIndex((c) => c.tone === "bad");
      return { n: chips.length, selectedIsFirstBad: chips[firstBad]?.on === true };
    }, { n: N_TESTS, selectedIsFirstBad: true });
    await s.expect("a failed submit does not mark the problem passed", () => page.locator(".ws-done").count(), 0);
    await s.expect("a failed submit toasts nothing", () => page.locator(".toast").count(), 0);
    await s.shot(page, "submit-wrong-console-desktop-light", { locator: page.locator(sel.tests) });
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 6 ------------------------------------------------------------------ */
scenario("06-stop", "Stop and the time limit end an endless loop; the next run still works", async (s) => {
  const { ctx, page } = await newPage(s);
  try {
    await openWorkspace(s, page);
    await s.expect("(setup) the page is cross-origin isolated, so Stop can interrupt without a reload", () => page.evaluate(() => crossOriginIsolated), true);

    // ---- Stop
    await setCode(page, LOOP);
    const before = await runsStarted(page);
    await page.locator(sel.run).click();
    await page.waitForFunction((n) => window.__wsRuns > n, before);
    await s.expect("while running: the console says 'Running case 1 of 3…'", () => page.locator(".ws-running p").textContent(), "Running case 1 of 3…", { timeout: 20_000 });
    await s.expect("while running: Stop replaces Run, Submit is disabled, runner says Running", async () => ({
      stop: await page.locator(sel.stop).count(), run: await page.locator(sel.run).count(), submitDisabled: await page.locator(sel.submit).isDisabled(), runner: await page.locator(".ws-runner").textContent(),
    }), { stop: 1, run: 0, submitDisabled: true, runner: "Running" });
    await s.expect("while running: the Result tab pulses", () => page.locator(`${sel.tests} .ws-tabs .ws-dot`).getAttribute("class"), "ws-dot pulse");
    await sleep(300);
    await s.shot(page, "stop-running-desktop-light", { runner: false });
    await page.locator(sel.stop).click();
    await page.locator(".ws-verdict").waitFor({ timeout: 20_000 });
    await s.expect("verdict: Stopped (info), 0 / 3 before you stopped it", () => verdictOf(page), { tone: "info", title: "Stopped", detail: "0 / 3 cases passed before you stopped it." });
    await s.expect("one chip (Case 1, stopped) and '2 not run'", async () => ({ chips: (await chipsOf(page)).map((c) => `${c.text}:${c.tone}:${c.title}`), notRun: await page.locator(".ws-notrun").textContent() }),
      { chips: ["Case 1:idle:Case 1 — Stopped"], notRun: "2 not run" });
    await s.expect("detail badge 'Stopped' with the input but no output", () => detailOf(page), (d) => d.badge === "Stopped" && d.title === "Case 1" && isEqual(d.blocks.Input, ["graph = " + CASE1]) && !("Output" in d.blocks));
    await s.expect("Run is back, Stop is gone", async () => ({ run: await page.locator(sel.run).count(), stop: await page.locator(sel.stop).count() }), { run: 1, stop: 0 });
    await s.shot(page, "stop-stopped-console-desktop-light", { locator: page.locator(sel.tests) });

    // ---- the next run still works
    await setCode(page, CORRECT);
    await startRun(s, page, "button");
    await s.expect("after Stop, a correct run passes", () => verdictOf(page), { tone: "ok", title: "Passed", detail: "3 / 3 cases passed · Submit runs the full suite" });

    // ---- the time limit
    await setCode(page, LOOP);
    const t0 = Date.now();
    await startRun(s, page, "button", { timeout: 40_000 });
    const took = Date.now() - t0;
    await s.expect("time limit: the run ends by itself within 15 s (not instantly, not never)", () => took, (v) => v > 1000 && v < 15_000);
    await s.expect("verdict: Time Limit Exceeded (warn)", () => verdictOf(page), { tone: "warn", title: "Time Limit Exceeded", detail: "0 / 3 cases passed before the clock ran out." });
    await s.expect("chip: Case 1 — Time limit, and '2 not run'", async () => ({ chips: (await chipsOf(page)).map((c) => `${c.text}:${c.tone}:${c.title}`), notRun: await page.locator(".ws-notrun").textContent() }),
      { chips: ["Case 1:warn:Case 1 — Time limit"], notRun: "2 not run" });
    await s.expect("detail explains the time limit", () => detailOf(page), (d) => d.badge === "Time limit" && d.notes.some((n) => n.startsWith("This case ran past its time limit.")));
    await s.shot(page, "stop-tle-console-desktop-light", { locator: page.locator(sel.tests) });

    await setCode(page, CORRECT);
    await startRun(s, page, "button");
    await s.expect("after the time limit, a correct run passes", () => verdictOf(page).then((v) => v.title), "Passed");
    await s.expect("…and the runner is Ready again", () => runnerPhase(page), "ready", { timeout: 30_000 });
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 7 ------------------------------------------------------------------ */
scenario("07-test-cases", "the Testcase tab: add, edit, remove, reset, run typed cases", async (s) => {
  const { ctx, page } = await newPage(s);
  try {
    await openWorkspace(s, page);
    const field = page.locator(".ws-field textarea");
    const chipBtn = (i) => page.locator(".ws-cases .ws-chip:not(.add) > button:first-child").nth(i);

    await s.expect("starts with the 3 examples, Case 1 active, no remove on single... (x only on the active chip)", () => caseChips(page), [
      { text: "Case 1", on: true, edited: false, hasRemove: true },
      { text: "Case 2", on: false, edited: false, hasRemove: false },
      { text: "Case 3", on: false, edited: false, hasRemove: false },
    ]);

    // add
    await page.getByRole("button", { name: "Add a case" }).click();
    await s.expect("Add a case: four chips, Case 4 active", async () => (await caseChips(page)).map((c) => c.text + (c.on ? "*" : "")), ["Case 1", "Case 2", "Case 3", "Case 4*"]);
    await s.expect("the new case is a copy of the case that was active", () => field.inputValue(), CASE1);
    await s.expect("a new case is not flagged 'edited' (it is simply a typed case)", async () => (await caseChips(page)).filter((c) => c.edited).length, 0);

    // edit
    const NEW4 = "[[1,2],[3],[3],[]]";
    await field.fill(NEW4);
    await s.expect("editing a field changes the value", () => field.inputValue(), NEW4);
    await chipBtn(0).click();
    await s.expect("Case 1 still has its own value", () => field.inputValue(), CASE1);
    await chipBtn(3).click();
    await s.expect("Case 4 kept its edit", () => field.inputValue(), NEW4);

    await chipBtn(1).click();
    await field.fill("[[1],[2],[]]");
    await s.expect("editing an example flags its chip as edited (reference will answer it)", async () => (await caseChips(page)).map((c) => c.text + (c.edited ? "!" : "")), ["Case 1", "Case 2!", "Case 3", "Case 4"]);
    await s.expect("the edited marker explains itself", () => page.locator(".ws-edited").getAttribute("title"), "Edited — the reference solution will answer it");
    await s.shot(page, "cases-edited-desktop-light");

    // run them (typed cases are answered by the reference solution)
    await setCode(page, CORRECT);
    await startRun(s, page, "button");
    await s.expect("run with 4 cases: Passed, 4 / 4", () => verdictOf(page), { tone: "ok", title: "Passed", detail: "4 / 4 cases passed · Submit runs the full suite" });
    await s.expect("four chips in Testcase order", async () => (await chipsOf(page)).map((c) => `${c.text}:${c.tone}`), ["Case 1:ok", "Case 2:ok", "Case 3:ok", "Case 4:ok"]);
    await page.locator('.ws-results [aria-label="Cases"] [role=tab]').nth(3).click();
    await s.expect("Case 4's detail: typed input, output equals the reference's answer", () => detailOf(page), (d) => d.title === "Case 4" && isEqual(d.blocks.Input, ["graph = " + NEW4]) && isEqual(d.blocks.Output, ["[[0,1,3],[0,2,3]]"]) && isEqual(d.blocks.Expected, ["[[0,1,3],[0,2,3]]"]));
    await page.locator('.ws-results [aria-label="Cases"] [role=tab]').nth(1).click();
    await s.expect("edited Case 2's detail: the edited input and the reference's answer", () => detailOf(page), (d) => d.title === "Case 2" && isEqual(d.blocks.Input, ["graph = [[1],[2],[]]"]) && isEqual(d.blocks.Output, ["[[0,1,2]]"]));
    await s.shot(page, "cases-run-desktop-light");

    // remove
    await page.getByRole("tab", { name: "Testcase" }).click();
    await s.expect("back on Testcase: the chips are unchanged (Case 2, the last one edited, is active)", async () => (await caseChips(page)).map((c) => c.text + (c.on ? "*" : "")), ["Case 1", "Case 2*", "Case 3", "Case 4"]);
    await chipBtn(3).click();
    await page.getByRole("button", { name: "Remove case 4" }).click();
    await s.expect("Remove case 4: three chips, the last one active", async () => (await caseChips(page)).map((c) => c.text + (c.on ? "*" : "")), ["Case 1", "Case 2", "Case 3*"]);
    await chipBtn(1).click();
    await s.expect("…the edit on Case 2 survived", () => field.inputValue(), "[[1],[2],[]]");
    await page.getByRole("button", { name: "Remove case 2" }).click();
    await s.expect("removing a middle case renumbers the rest", async () => (await caseChips(page)).map((c) => c.text + (c.on ? "*" : "")), ["Case 1", "Case 2*"]);
    await s.expect("…and Case 2 is now the old Case 3 (an example, so not edited)", async () => ({ v: await field.inputValue(), edited: (await caseChips(page)).filter((c) => c.edited).length }), { v: CASE3, edited: 0 });
    await page.getByRole("button", { name: "Remove case 2" }).click();
    await s.expect("down to one case: its remove button is gone", () => caseChips(page), [{ text: "Case 1", on: true, edited: false, hasRemove: false }]);

    // reset
    await page.locator(".ws-cases .ws-linkbtn").click();
    await s.expect("Reset (back to the examples): three chips, Case 1 active", () => caseChips(page), [
      { text: "Case 1", on: true, edited: false, hasRemove: true },
      { text: "Case 2", on: false, edited: false, hasRemove: false },
      { text: "Case 3", on: false, edited: false, hasRemove: false },
    ]);
    const vals = [];
    for (let i = 0; i < 3; i++) {
      await chipBtn(i).click();
      vals.push(await field.inputValue());
    }
    await s.expect("…with the original example values", () => vals, [CASE1, CASE2, CASE3]);
    await s.expect("Reset leaves the editor alone", () => codeOf(page), CORRECT);
    await page.getByRole("button", { name: "Add a case" }).click();
    await s.expect("(setup) a fourth case is added and active", async () => (await caseChips(page)).map((c) => c.text + (c.on ? "*" : "")), ["Case 1", "Case 2", "Case 3", "Case 4*"]);
    await page.locator(".ws-cases .ws-linkbtn").click();
    await s.expect("Reset from Case 4 drops it and goes back to Case 1", async () => (await caseChips(page)).map((c) => c.text + (c.on ? "*" : "")), ["Case 1*", "Case 2", "Case 3"]);

    // a typed case that does not parse
    await chipBtn(0).click();
    await field.fill("not json {");
    await startRun(s, page, "button");
    await s.expect("an unparseable case: verdict 'Check your input' (warn)", () => verdictOf(page), { tone: "warn", title: "Check your input", detail: "A case you typed didn't parse." });
    await s.expect("…its chip is amber, the others green", async () => (await chipsOf(page)).map((c) => `${c.text}:${c.tone}`), ["Case 1:warn", "Case 2:ok", "Case 3:ok"]);
    await s.expect("the detail that opens is the unparseable Case 1's, the one the verdict is about", () => detailOf(page).then((d) => d.title), "Case 1");
    await page.locator('.ws-results [aria-label="Cases"] [role=tab]').nth(0).click();
    await s.expect("…clicking Case 1 says its input didn't parse", () => detailOf(page), (d) => d.badge === "Bad input" && d.title === "Case 1" && d.notes.some((n) => n.startsWith("This input didn't parse:")));
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 8 ------------------------------------------------------------------ */
scenario("08-editor-chrome", "font size, Reset, Esc to close, drafts", async (s) => {
  const { ctx, page } = await newPage(s);
  try {
    await openWorkspace(s, page);
    const font = () => page.evaluate(() => ({ label: document.querySelector(".ws-font").textContent, px: getComputedStyle(document.querySelector(".cm-editor")).fontSize }));
    const bigger = page.getByRole("button", { name: "Larger text" });
    const smaller = page.getByRole("button", { name: "Smaller text" });
    await s.expect("default font size is 14px (label and editor)", font, { label: "14px", px: "14px" });
    await bigger.click();
    await s.expect("Larger text: 15px", font, { label: "15px", px: "15px" });
    await bigger.click();
    await bigger.click();
    await s.expect("Larger text x3: 17px", font, { label: "17px", px: "17px" });
    await s.expect("the size is remembered in the workspace prefs", () => prefsOf(page).then((p) => p?.font), 17);
    await s.shot(page, "font-large-desktop-light");
    for (let i = 0; i < 4; i++) await smaller.click();
    await s.expect("Smaller text x4: 13px", font, { label: "13px", px: "13px" });
    for (let i = 0; i < 12; i++) await bigger.click();
    await s.expect("the largest size is 22px", font, { label: "22px", px: "22px" });
    for (let i = 0; i < 14; i++) await smaller.click();
    await s.expect("the smallest size is 11px", font, { label: "11px", px: "11px" });
    await s.shot(page, "font-small-desktop-light");
    for (let i = 0; i < 3; i++) await bigger.click();
    await s.expect("back to 14px", font, { label: "14px", px: "14px" });

    // Reset
    const reset = page.locator(`${sel.code} .ws-toolbar .ws-linkbtn[title="Back to the starter code"]`);
    await reset.click();
    await s.expect("Reset on untouched starter code: no confirm dialog", () => s.dialogs.length, 0);
    await setCode(page, CORRECT);
    await s.expect("(setup) the draft is saved", () => draftOf(page), CORRECT, { timeout: 3000 });
    await reset.click(); // dialog is dismissed
    await s.expect("Reset asks first, with this wording", () => s.dialogs, ["confirm: Reset to the starter code? Your draft for this problem is cleared."]);
    await s.expect("…declining keeps the code and the draft", async () => ({ code: await codeOf(page), draft: await draftOf(page) }), { code: CORRECT, draft: CORRECT });
    s.acceptDialogs = true;
    await reset.click();
    await s.expect("…accepting restores the starter code", () => codeOf(page), STARTER, { timeout: 3000 });
    await s.expect("…and clears the draft", () => draftOf(page), null, { timeout: 3000 });
    await setCode(page, "x = 1\n");
    await s.expect("…and the editor still takes typing", () => codeOf(page), "x = 1\n");

    // Esc: inside the editor it must not close
    await page.keyboard.press("Escape");
    await sleep(300);
    await s.expect("Escape inside the editor does not close the workspace", () => page.locator(sel.dialog).count(), 1, { timeout: 0 });

    // type, then close at once with Esc from outside the editor (inside the 400 ms debounce, so the
    // draft can only be saved by the way-out path), reopen
    await setCode(page, CORRECT);
    await page.evaluate(() => document.activeElement?.blur());
    await s.expect("(setup) focus is outside the editor", () => page.evaluate(() => !document.activeElement?.closest(".cm-editor")), true);
    await page.keyboard.press("Escape");
    await s.expect("Escape outside the editor closes the workspace", () => page.locator(sel.dialog).count(), 0, { timeout: 3000 });
    await s.expect("…the Line is back (hero and tabs)", async () => ({ hero: await page.locator(".hero h1").count(), tab: await page.locator(".tabs .tab.on").textContent() }), { hero: 1, tab: "Line" });
    await s.expect("…and the page scrolls again (body overflow restored)", () => page.evaluate(() => document.body.style.overflow), "");
    await s.expect("…focus went back to the button that opened the editor", () => page.evaluate(() => document.activeElement?.getAttribute("aria-label")), `Solve ${TITLE} in the editor`);
    await s.expect("…the draft was saved on the way out", () => draftOf(page), CORRECT);
    await s.expect("…and the font size was kept", () => prefsOf(page).then((p) => p?.font), 14);
    await page.locator(sel.openBtn).first().click();
    await page.locator(sel.dialog).waitFor();
    await page.locator(sel.editorContent).waitFor();
    await s.expect("reopening the same problem restores the edited draft", () => codeOf(page), CORRECT, { timeout: 3000 });
    await s.expect("…and the 14px font", font, { label: "14px", px: "14px" });
    // the back button closes as well
    await page.locator(sel.back).click();
    await s.expect("the back chevron closes the workspace too", () => page.locator(sel.dialog).count(), 0, { timeout: 3000 });
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 9 ------------------------------------------------------------------ */
scenario("09-copy-for-claude", "Copy for Claude: feedback and clipboard text", async (s) => {
  const { ctx, page } = await newPage(s, { permissions: ["clipboard-read", "clipboard-write"] });
  try {
    await openWorkspace(s, page);
    const btn = page.locator(sel.copy);
    await s.expect("the button reads 'Copy for Claude'", () => btn.innerText(), "Copy for Claude");
    await s.expect("…and is not in its 'ok' state", () => btn.getAttribute("class"), "ws-btn ghost");

    await setCode(page, WRONG);
    await startRun(s, page, "button");
    await btn.click();
    await s.expect("clicking shows 'Copied'", () => btn.innerText(), "Copied");
    await s.expect("…in its green 'ok' state", () => btn.getAttribute("class"), "ws-btn ghost ok");
    // the shot has to land inside the 2.2 s 'Copied' window; if a slow machine misses it, click again
    for (let i = 0; i < 4; i++) {
      if ((await btn.innerText()) !== "Copied") await btn.click();
      await s.shot(page, "copied-header-desktop-light", { locator: page.locator(".ws-head") });
      if ((await btn.innerText()) === "Copied") break;
    }

    const text = await page.evaluate(() => navigator.clipboard.readText());
    await s.expect("clipboard: title line with the LeetCode number", () => text.split("\n")[0], `# ${TITLE} (LeetCode 797)`);
    await s.expect("clipboard: statement without the title (starts at '## The task')", () => text.split("\n")[2], "## The task");
    await s.expect("clipboard: 'My code so far' with the code in a python fence", () => text.includes("## My code so far\n\n```python\n" + WRONG.trimEnd() + "\n```"), true);
    await s.expect("clipboard: the last run, with the failing case", () => /## Last run: Wrong Answer\n\n1 \/ 3 cases passed\n\nOn an example:\n\nInput:\n {4}graph = \[\[1,2,3\],\[4\],\[1,4\],\[4\],\[\]\]\nOutput:\n {4}\[\]\nExpected:\n {4}\[\[0,1,4\],\[0,2,1,4\],\[0,2,4\],\[0,3,4\]\]/.test(text), true);
    await s.expect("clipboard: ends with the interviewer instruction", () => text.trimEnd().endsWith("give a hint only when I ask for one.*"), true);
    await s.expect("the button goes back to 'Copy for Claude' after a couple of seconds", () => btn.innerText(), "Copy for Claude", { timeout: 6000 });
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 10 ----------------------------------------------------------------- */
const mockRequests = () => {
  if (!MOCK_LOG || !fs.existsSync(MOCK_LOG)) return null;
  return fs
    .readFileSync(MOCK_LOG, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .filter((r) => r.body);
};

scenario("10-assistant", "the assistant: lock, wrong and right password, stream, Esc, Ctrl+K, new chat, forget", async (s) => {
  const { ctx, page } = await newPage(s);
  try {
    const mock0 = mockRequests()?.length ?? 0;
    await openWorkspace(s, page);
    const panel = page.locator(sel.panel);
    const lock = (t) => panel.locator(".asst-lock");
    const q = () => panel.getByLabel("Your question");
    const pw = () => panel.getByLabel("Assistant password");
    const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem("onsite-express-assistant-v1") || "{}"));

    await s.expect("no assistant until asked for (not even mounted)", () => panel.count(), 0);
    // give the question a run to carry along
    await startRun(s, page, "button");
    await s.expect("(setup) the starter code runs to a Wrong Answer", () => verdictOf(page).then((v) => v.title), "Wrong Answer");

    await page.keyboard.press("Control+k");
    await panel.waitFor({ state: "visible" });
    await s.expect("Ctrl+K opens the assistant", () => panel.isVisible(), true);
    await s.expect("the Ask button shows pressed", () => page.locator(sel.ask).getAttribute("aria-pressed"), "true");
    await s.expect("it opens on the lock screen, focus in the password field", async () => ({ lock: await lock().count(), focus: await page.evaluate(() => document.activeElement?.getAttribute("aria-label")) }), { lock: 1, focus: "Assistant password" }, { timeout: 2000 });
    await s.expect("lock copy: 'Locked to you.'", () => lock().locator("b").textContent(), "Locked to you.");
    await s.expect("Unlock is disabled until something is typed", () => lock().getByRole("button", { name: "Unlock" }).isDisabled(), true);
    await s.expect("the floating window sits bottom right, 400 px wide", () => panel.evaluate((e) => { const r = e.getBoundingClientRect(); return { cls: e.className, w: Math.round(r.width), right: Math.round(window.innerWidth - r.right), bottom: Math.round(window.innerHeight - r.bottom) }; }), { cls: "asst float", w: 400, right: 24, bottom: 24 });
    await s.shot(page, "assistant-locked-desktop-light");

    // a wrong password: the Worker says 401 and the lock comes back
    await pw().fill("wrong-pw");
    await pw().press("Enter");
    await s.expect("a typed password unlocks the composer (checked only by the Worker)", () => q().count(), 1, { timeout: 3000 });
    await s.expect("the starters are offered", () => panel.locator(".asst-starters button").allTextContents(), ["Why does my code fail?", "Is my approach on the right track?", "What's the complexity of my code?"]);
    await q().fill("Why does my code fail?");
    await q().press("Enter");
    await s.expect("wrong password: the lock is back with 'That password didn't work.'", () => lock().locator("b").textContent(), "That password didn't work.", { timeout: 15_000 });
    await s.expect("…and the refused password is forgotten", async () => "password" in (await stored()), false);
    if (MOCK_LOG) await s.expect("…and nothing reached the model", () => (mockRequests()?.length ?? 0) - mock0, 0);

    // the right one: the bounced question goes out again by itself
    await pw().fill("pw-test");
    await pw().press("Enter");
    await s.expect("right password: the question that bounced is re-sent and answered", () => panel.locator(".asst-a").innerText(), "Use a hash map.", { timeout: 20_000 });
    await s.expect("…exactly one question and one answer", async () => ({ q: await panel.locator(".asst-q").count(), a: await panel.locator(".asst-a").count() }), { q: 1, a: 1 });
    await s.expect("…the question is shown with '+ code' and '+ last run' tags", () => panel.locator(".asst-q").evaluate((e) => ({ text: e.querySelector("p").textContent, tags: [...e.querySelectorAll(".asst-tags span")].map((t) => t.textContent) })), { text: "Why does my code fail?", tags: ["+ code", "+ last run"] });
    await s.expect("…the password is stored", async () => (await stored()).password, "pw-test");
    await s.expect("…no thinking dots are left, and Send (not Stop) is showing", async () => ({ wait: await panel.locator(".asst-wait").count(), send: await panel.getByRole("button", { name: "Send" }).count(), stop: await panel.getByRole("button", { name: "Stop" }).count() }), { wait: 0, send: 1, stop: 0 }, { timeout: 5000 });
    await s.expect("…the header offers New chat, Forget the password, Close", () => panel.locator(".asst-head button").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label"))), ["New chat", "Forget the password", "Close the assistant"]);
    const reqs = mockRequests();
    if (reqs) {
      const last = reqs[reqs.length - 1];
      const content = last?.body?.messages?.at(-1)?.content ?? "";
      await s.expect("the model got the API key from the Worker's secrets", () => last?.apiKey, "sk-ant-test");
      await s.expect("the model got the problem in the system prompt", () => JSON.stringify(last?.body?.system ?? ""), (v) => v.includes(`<problem title=\\"${TITLE}\\"`) && v.includes("A directed graph has"));
      await s.expect("the model got the code, the last run and the question, in that order", () => content, (c) => c.startsWith("My code now:\n\n```python\n" + STARTER.trimEnd() + "\n```\n\n## Last run: Wrong Answer\n\n0 / 3 cases passed\n\nOn an example:") && c.endsWith("\n\nMy question: Why does my code fail?"));
      await s.expect("exactly one request reached the model so far", () => reqs.length - mock0, 1);
    }
    await s.shot(page, "assistant-open-desktop-light");
    await dark(page);
    await s.shot(page, "assistant-open-desktop-dark");
    await page.emulateMedia({ colorScheme: "light" });

    // a second question, same code, same run: no tags, and history goes with it
    await q().fill("And its complexity?");
    await q().press("Enter");
    await s.expect("second question: answered, two exchanges on screen", async () => ({ q: await panel.locator(".asst-q").count(), a: await panel.locator(".asst-a").count() }), { q: 2, a: 2 }, { timeout: 20_000 });
    await s.expect("…the second question carries no tags (nothing changed)", () => panel.locator(".asst-q").nth(1).locator(".asst-tags").count(), 0);
    const reqs2 = mockRequests();
    if (reqs2) {
      const msgs = reqs2[reqs2.length - 1]?.body?.messages ?? [];
      await s.expect("…and the model got the whole conversation (user, assistant, user)", () => msgs.map((m) => m.role + ":" + String(m.content).slice(0, 14)), ["user:My code now:\n\n", "assistant:Use a hash map", "user:And its comple"]);
    }

    // Esc closes, Ctrl+K reopens with the conversation, focus in the composer
    await page.keyboard.press("Escape");
    await s.expect("Escape closes the assistant", () => panel.isHidden(), true, { timeout: 2000 });
    await s.expect("…the workspace is still open", () => page.locator(sel.dialog).count(), 1);
    await s.expect("…focus is not left inside the hidden window", () => page.evaluate(() => !document.activeElement?.closest(".asst")), true);
    await s.expect("…the Ask button no longer shows pressed", () => page.locator(sel.ask).getAttribute("aria-pressed"), "false");
    await page.keyboard.press("Control+k");
    await s.expect("Ctrl+K reopens it", () => panel.isVisible(), true, { timeout: 2000 });
    await s.expect("…the conversation is still there", async () => ({ q: await panel.locator(".asst-q").count(), a: await panel.locator(".asst-a").count() }), { q: 2, a: 2 });
    await s.expect("…and focus lands in the composer", () => page.evaluate(() => document.activeElement?.getAttribute("aria-label")), "Your question", { timeout: 2000 });
    // Ctrl+K from inside it puts it away again
    await page.keyboard.press("Control+k");
    await s.expect("Ctrl+K from inside the window closes it", () => panel.isHidden(), true, { timeout: 2000 });
    await page.locator(sel.ask).click();
    await s.expect("the Ask button opens it again", () => panel.isVisible(), true, { timeout: 2000 });

    // New chat
    await panel.getByRole("button", { name: "New chat" }).click();
    await s.expect("New chat empties the conversation (starters are back)", async () => ({ q: await panel.locator(".asst-q").count(), a: await panel.locator(".asst-a").count(), starters: await panel.locator(".asst-starters button").count() }), { q: 0, a: 0, starters: 3 });
    await s.expect("…the New chat button is gone (nothing to clear)", () => panel.getByRole("button", { name: "New chat" }).count(), 0);
    await s.expect("…the password is kept", async () => (await stored()).password, "pw-test");
    // a starter asks straight away
    await panel.locator(".asst-starters button").nth(2).click();
    await s.expect("a starter sends its question and gets an answer", () => panel.locator(".asst-q p").allTextContents().then(async (t) => [t, await panel.locator(".asst-a").innerText()]), [["What's the complexity of my code?"], "Use a hash map."], { timeout: 20_000 });

    // Forget
    await panel.getByRole("button", { name: "Forget the password" }).click();
    await s.expect("Forget the password: the lock screen is back ('Locked to you.')", () => lock().locator("b").textContent(), "Locked to you.");
    await s.expect("…and the password is gone from storage", async () => "password" in (await stored()), false);
    await s.expect("…the Forget button is gone", () => panel.getByRole("button", { name: "Forget the password" }).count(), 0);
    // the X button
    await panel.getByRole("button", { name: "Close the assistant" }).click();
    await s.expect("the X button closes the window", () => panel.isHidden(), true, { timeout: 2000 });
    finish(s);
  } finally {
    await ctx.close();
  }
}, { serial: true }); // reads the mock Anthropic log, so nothing else may be talking to it

/* 11 ----------------------------------------------------------------- */
scenario("11-phone", "390x844 touch: segmented panes, run jumps to Tests, bottom-sheet assistant", async (s) => {
  const { ctx, page } = await newPage(s, { phone: true });
  try {
    await openWorkspace(s, page);
    const seg = () => page.locator(".ws-seg [role=tab]").evaluateAll((els) => els.map((e) => e.textContent.trim() + ":" + e.getAttribute("aria-selected")));
    const tab = (name) => page.locator(".ws-seg").getByRole("tab", { name });

    await s.expect("the segmented control: Problem (selected), Code, Tests", seg, ["Problem:true", "Code:false", "Tests:false"]);
    await s.expect("it is a tablist labelled 'Workspace panes'", () => page.locator(".ws-seg").getAttribute("aria-label"), "Workspace panes");
    await s.expect("only the Problem pane is showing", async () => ({ problem: await page.locator(sel.problem).isVisible(), code: await page.locator(sel.code).isVisible(), tests: await page.locator(sel.tests).isVisible() }), { problem: true, code: false, tests: false });
    await s.expect("phone header: no stopwatch, and the buttons are icons only", async () => ({ clock: await page.locator(".wclock").count(), labels: await page.locator(".ws-actions button").evaluateAll((els) => els.map((e) => e.textContent.trim())) }), { clock: 0, labels: ["", "", "Run", "Submit"] });
    await s.expect("no horizontal page scroll", () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await s.shot(page, "phone-problem-light");

    await tab("Code").tap();
    await s.expect("tapping Code selects it", seg, ["Problem:false", "Code:true", "Tests:false"]);
    await s.expect("only the Code pane is showing", async () => ({ problem: await page.locator(sel.problem).isVisible(), code: await page.locator(sel.code).isVisible(), tests: await page.locator(sel.tests).isVisible() }), { problem: false, code: true, tests: false });
    await s.expect("the editor holds the starter and Python is Ready", async () => ({ code: await codeOf(page), runner: await page.locator(".ws-runner").textContent() }), { code: STARTER, runner: "Ready" });
    await s.shot(page, "phone-code-light");

    await tab("Tests").tap();
    await s.expect("tapping Tests selects it", seg, ["Problem:false", "Code:false", "Tests:true"]);
    await s.expect("only the Tests pane is showing, on the Testcase tab", async () => ({ problem: await page.locator(sel.problem).isVisible(), code: await page.locator(sel.code).isVisible(), tests: await page.locator(sel.tests).isVisible(), tab: await consoleTab(page) }), { problem: false, code: false, tests: true, tab: "Testcase" });
    await s.expect("three cases are listed", () => caseNames(page), ["Case 1", "Case 2", "Case 3"]);
    await s.shot(page, "phone-tests-light");

    await tab("Problem").tap();
    await s.expect("tapping Problem goes back", seg, ["Problem:true", "Code:false", "Tests:false"]);
    await tab("Code").tap();
    await setCode(page, CORRECT);
    await s.expect("typing works in the phone editor", () => codeOf(page), CORRECT);
    await s.expect("(setup) the Code tab is showing", seg, ["Problem:false", "Code:true", "Tests:false"]);
    await page.locator(sel.run).tap();
    await page.locator(".ws-verdict").waitFor({ state: "attached", timeout: 60_000 });
    await s.expect("running from the Code tab switches to Tests", seg, (v) => v[2] === "Tests:true" && v[1] === "Code:false");
    await s.expect("…on the Result tab, with the verdict", async () => ({ tab: await consoleTab(page), v: await verdictOf(page) }), { tab: "Result", v: { tone: "ok", title: "Passed", detail: "3 / 3 cases passed · Submit runs the full suite" } });
    await s.expect("…and the Tests segment carries a green dot", () => page.locator('.ws-seg [role=tab]').nth(2).locator(".ws-dot").getAttribute("class"), "ws-dot ok");
    await s.shot(page, "phone-result-light");
    await dark(page);
    await s.shot(page, "phone-result-dark");
    await page.emulateMedia({ colorScheme: "light" });

    // the assistant as a bottom sheet
    await page.locator(sel.ask).tap();
    const panel = page.locator(sel.panel);
    await s.expect("Ask opens the assistant as a bottom sheet", () => panel.evaluate((e) => ({ cls: e.className, hidden: e.hidden })), { cls: "asst sheet", hidden: false }, { timeout: 2000 });
    await s.expect("…full width, pinned to the bottom edge", () => panel.evaluate((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), w: Math.round(r.width), bottom: Math.round(window.innerHeight - r.bottom), tall: r.height > 300 }; }), { x: 0, w: 390, bottom: 0, tall: true });
    await s.expect("…on the lock screen", () => panel.locator(".asst-lock").count(), 1);
    await s.shot(page, "phone-sheet-locked-light");
    await panel.getByLabel("Assistant password").fill("pw-test");
    await panel.getByLabel("Assistant password").press("Enter");
    await panel.getByLabel("Your question").fill("Why does my code fail?");
    await panel.getByLabel("Your question").press("Enter");
    await s.expect("a question in the sheet streams the answer", () => panel.locator(".asst-a").innerText(), "Use a hash map.", { timeout: 20_000 });
    await s.expect("…tagged '+ code' and '+ last run'", () => panel.locator(".asst-tags span").allTextContents(), ["+ code", "+ last run"]);
    await s.expect("(settle) the stream is over", () => panel.getByRole("button", { name: "Send" }).count(), 1, { timeout: 5000 });
    await s.shot(page, "phone-sheet-chat-light");
    await dark(page);
    await s.shot(page, "phone-sheet-chat-dark");
    await page.emulateMedia({ colorScheme: "light" });
    await panel.getByRole("button", { name: "Close the assistant" }).tap();
    await s.expect("the X closes the sheet", () => panel.isHidden(), true, { timeout: 2000 });
    await page.locator(sel.ask).tap();
    await s.expect("reopening keeps the conversation", () => panel.locator(".asst-q").count(), 1, { timeout: 2000 });
    await s.expect("still no horizontal page scroll", () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 12 ----------------------------------------------------------------- */
scenario("12-run-errors", "runtime error, syntax error and printed output", async (s) => {
  const { ctx, page } = await newPage(s);
  try {
    await openWorkspace(s, page);

    await setCode(page, RUNTIME_ERR);
    await startRun(s, page, "button");
    await s.expect("runtime error: verdict Runtime Error, 0 / 3", () => verdictOf(page), { tone: "bad", title: "Runtime Error", detail: "0 / 3 cases passed" });
    await s.expect("…the detail names the exception and the line", () => detailOf(page), (d) => d.badge === "Error" && d.errors.some((e) => e.startsWith("NameError: name 'undefined_name' is not defined") && e.endsWith("line 4")));
    await s.expect("…the failing line is banded red in the editor", () => page.locator(".cm-errline").allTextContents(), ["        return undefined_name(graph)"]);
    await s.shot(page, "error-runtime-desktop-light");

    await setCode(page, RUNTIME_ERR + "# edit\n");
    await s.expect("an edit clears the red band", () => page.locator(".cm-errline").count(), 0);

    await setCode(page, SYNTAX_ERR);
    await startRun(s, page, "button");
    await s.expect("syntax error: verdict Syntax Error, pointing at line 2", () => verdictOf(page), { tone: "bad", title: "Syntax Error", detail: "Python couldn't read the file — line 2." });
    await s.expect("…the error box shows the SyntaxError and its line", () => page.locator(".ws-results .ws-error-msg").allTextContents(), (e) => e.length === 1 && e[0].startsWith("SyntaxError: expected ':'") && e[0].endsWith("line 2"));
    await s.expect("…and there are no case chips (nothing ran)", () => page.locator('.ws-results [aria-label="Cases"]').count(), 0);
    await s.expect("…line 2 is banded in the editor", () => page.locator(".cm-errline").allTextContents(), ["    def allPathsSourceTarget(self, graph)"]);
    await s.shot(page, "error-syntax-desktop-light");

    await setCode(page, PRINTS);
    await startRun(s, page, "button");
    await s.expect("printed output shows up under Stdout", () => detailOf(page), (d) => isEqual(d.blocks.Stdout, ["hello from the solution\n"]));
    await s.expect("…and a fixed run clears the error band", () => page.locator(".cm-errline").count(), 0);
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 13 ----------------------------------------------------------------- */
scenario("13-layout", "split panes (keyboard and drag, remembered) and the stopwatch", async (s) => {
  const { ctx, page } = await newPage(s);
  try {
    await openWorkspace(s, page);
    const sepX = page.locator('[role=separator][aria-label="Resize the statement"]');
    const sepY = page.locator('[role=separator][aria-label="Resize the editor"]');
    const val = (loc) => loc.getAttribute("aria-valuenow");

    await s.expect("two separators: statement (vertical, 42) and editor (horizontal, 62)", async () => ({
      x: [await sepX.getAttribute("aria-orientation"), await val(sepX), await sepX.getAttribute("aria-valuemin"), await sepX.getAttribute("aria-valuemax")],
      y: [await sepY.getAttribute("aria-orientation"), await val(sepY), await sepY.getAttribute("aria-valuemin"), await sepY.getAttribute("aria-valuemax")],
    }), { x: ["vertical", "42", "20", "80"], y: ["horizontal", "62", "25", "85"] });

    await sepX.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await s.expect("ArrowRight x2 on the statement handle: 42 -> 48", () => val(sepX), "48");
    await page.keyboard.press("ArrowLeft");
    await s.expect("ArrowLeft: 45", () => val(sepX), "45");
    for (let i = 0; i < 12; i++) await page.keyboard.press("ArrowLeft");
    await s.expect("the statement can't shrink past 20", () => val(sepX), "20");
    for (let i = 0; i < 25; i++) await page.keyboard.press("ArrowRight");
    await s.expect("…or grow past 80", () => val(sepX), "80");
    await s.expect("the statement pane's flex-basis follows", () => page.locator(".split-a").first().evaluate((e) => e.style.flexBasis), "80%");
    for (let i = 0; i < 14; i++) await page.keyboard.press("ArrowLeft");
    await s.expect("back near the middle: 80 - 14x3 = 38", () => val(sepX), "38");

    await sepY.focus();
    await page.keyboard.press("ArrowUp");
    await s.expect("ArrowUp on the editor handle: 62 -> 59", () => val(sepY), "59");
    for (let i = 0; i < 20; i++) await page.keyboard.press("ArrowDown");
    await s.expect("the editor can't take more than 85", () => val(sepY), "85");
    for (let i = 0; i < 25; i++) await page.keyboard.press("ArrowUp");
    await s.expect("…or less than 25", () => val(sepY), "25");
    for (let i = 0; i < 12; i++) await page.keyboard.press("ArrowDown");
    await s.expect("25 + 12x3 = 61", () => val(sepY), "61");
    await s.expect("the ratios are stored in the workspace prefs", () => prefsOf(page).then((p) => [Math.round(p.splitX * 100), Math.round(p.splitY * 100)]), [38, 61]);

    // drag the statement handle with the pointer
    const box = await sepX.boundingBox();
    const split = await page.locator(".split-row").first().boundingBox();
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const targetX = split.x + split.width * 0.55;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(targetX - 40, startY, { steps: 4 });
    await page.mouse.move(targetX, startY, { steps: 4 });
    await s.expect("while dragging, the container is marked .dragging", () => page.locator(".split-row.dragging").count(), 1);
    await page.mouse.up();
    await s.expect("after the drag the container is released", () => page.locator(".split.dragging").count(), 0);
    await s.expect("dragging the handle to 55% of the width sets the ratio to 55", () => val(sepX), "55");
    await s.expect("…and remembers it", () => prefsOf(page).then((p) => Math.round(p.splitX * 100)), 55);
    const boxY = await sepY.boundingBox();
    const col = await page.locator(".split-col").first().boundingBox();
    await page.mouse.move(boxY.x + boxY.width / 2, boxY.y + boxY.height / 2);
    await page.mouse.down();
    await page.mouse.move(boxY.x + boxY.width / 2, col.y + col.height * 0.7, { steps: 6 });
    await page.mouse.up();
    await s.expect("dragging the editor handle to 70% of the column height sets 70", () => val(sepY), "70");
    await s.shot(page, "layout-resized-desktop-light");

    // remembered across close and reopen
    await page.locator(sel.back).click();
    await page.locator(sel.openBtn).first().click();
    await page.locator(sel.dialog).waitFor();
    await s.expect("reopened: both splits are where they were left (55 / 70)", async () => [await val(sepX), await val(sepY)], ["55", "70"], { timeout: 3000 });
    await waitReady(page);

    // the stopwatch
    const clock = page.locator(".wclock-time");
    const label = () => clock.getAttribute("aria-label");
    const text = () => clock.textContent();
    await s.expect("stopwatch: ticking, reads mm:ss", async () => [await label(), /^\d\d:\d\d$/.test((await text()).trim())], ["Pause the clock", true]);
    const t1 = (await text()).trim();
    await sleep(2200);
    await s.expect("…it counts up", async () => (await text()).trim() !== t1, true);
    await clock.click();
    await s.expect("clicking pauses it (label flips, 'paused' class)", async () => [await label(), await page.locator(".wclock.paused").count()], ["Resume the clock", 1]);
    const t2 = (await text()).trim();
    await sleep(2200);
    await s.expect("…and the time holds still", async () => (await text()).trim() === t2, true, { timeout: 0 });
    await clock.click();
    await s.expect("clicking again resumes it", async () => [await label(), await page.locator(".wclock.paused").count()], ["Pause the clock", 0]);
    await sleep(1300);
    await page.getByRole("button", { name: "Reset the clock" }).click();
    await s.expect("reset sets it back to 00:00 and it keeps running", async () => [(await text()).trim(), await label()], ["00:00", "Pause the clock"]);

    // crossing the 900px breakpoint swaps the layout live and keeps the work
    await setCode(page, CORRECT);
    await startRun(s, page, "button");
    await s.expect("(setup) a run is on screen", () => verdictOf(page).then((v) => v.title), "Passed");
    await page.getByRole("tab", { name: "Solution" }).click();
    await page.getByRole("button", { name: "Reveal the solution" }).click();
    await s.expect("(setup) the reference solution is revealed", () => page.locator(".ws-veil").count(), 0);
    await page.setViewportSize({ width: 800, height: 860 });
    await s.expect("below 900px: the segmented control replaces the splits", async () => ({ seg: await page.locator(".ws-seg").count(), split: await page.locator(".split").count(), clock: await page.locator(".wclock").count() }), { seg: 1, split: 0, clock: 0 });
    await s.expect("…opening on the Problem pane", () => page.locator(".ws-seg [role=tab]").evaluateAll((els) => els.map((e) => e.getAttribute("aria-selected"))), ["true", "false", "false"]);
    await s.expect("…the revealed solution stays revealed", async () => ({ veil: await page.locator(".ws-veil").count(), ref: await page.locator(".ws-sol-code").count() }), { veil: 0, ref: 1 });
    await page.locator(".ws-seg").getByRole("tab", { name: "Code" }).click();
    await s.expect("…the code survived the switch", () => codeOf(page), CORRECT);
    await page.locator(sel.editorContent).first().click();
    await page.keyboard.press("Control+z");
    await s.expect("…and so did its undo history (Ctrl+Z goes back to the starter)", () => codeOf(page), STARTER);
    await page.keyboard.press("Control+Shift+z");
    await s.expect("…and Ctrl+Shift+Z redoes it", () => codeOf(page), CORRECT);
    await page.locator(".ws-seg").getByRole("tab", { name: "Tests" }).click();
    await s.expect("…and so did the last run (Tests pane, Result tab, Passed)", async () => ({ tab: await consoleTab(page), v: (await verdictOf(page)).title }), { tab: "Result", v: "Passed" });
    await page.setViewportSize({ width: 1280, height: 860 });
    await s.expect("back above 900px: splits are back at their saved ratios, no segmented control", async () => ({ seg: await page.locator(".ws-seg").count(), x: await val(sepX), y: await val(sepY), clock: await page.locator(".wclock").count() }), { seg: 0, x: "55", y: "70", clock: 1 });
    await s.expect("…and the editor still holds the code", () => codeOf(page), CORRECT);
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 14 ----------------------------------------------------------------- */
scenario("14-assistant-errors", "assistant: server-side failures show up in the panel", async (s) => {
  const { ctx, page } = await newPage(s, { storage: { "onsite-express-assistant-v1": JSON.stringify({ password: "pw-test" }) } });
  try {
    await openWorkspace(s, page);
    const panel = page.locator(sel.panel);
    await page.locator(sel.ask).click();
    await panel.waitFor({ state: "visible" });
    await s.expect("a stored password opens straight onto the composer", async () => ({ lock: await panel.locator(".asst-lock").count(), q: await panel.getByLabel("Your question").count() }), { lock: 0, q: 1 }, { timeout: 2000 });
    await s.expect("the composer has focus", () => page.evaluate(() => document.activeElement?.getAttribute("aria-label")), "Your question", { timeout: 2000 });
    await s.expect("Send is disabled while the box is empty", () => panel.getByRole("button", { name: "Send" }).isDisabled(), true);

    // Shift+Enter makes a newline; Enter sends
    const q = panel.getByLabel("Your question");
    await q.fill("first line");
    await q.press("Shift+Enter");
    await q.pressSequentially("AUTHFAIL second line");
    await s.expect("Shift+Enter inserts a newline instead of sending", async () => ({ v: await q.inputValue(), q: await panel.locator(".asst-q").count() }), { v: "first line\nAUTHFAIL second line", q: 0 });
    await q.press("Enter");
    await s.expect("an upstream 401 is explained in an alert, with Retry", () => panel.locator(".asst-trouble").innerText(), /Anthropic rejected the API key\. Check the Worker's ANTHROPIC_API_KEY secret\.\s*Retry/, { timeout: 20_000 });
    await s.expect("…the question stays in the log, the composer is empty again", async () => ({ q: await panel.locator(".asst-q p").allTextContents(), draft: await q.inputValue(), lock: await panel.locator(".asst-lock").count() }), { q: ["first line\nAUTHFAIL second line"], draft: "", lock: 0 });
    await s.shot(page, "assistant-error-desktop-light");
    await panel.getByRole("button", { name: "Retry" }).click();
    await s.expect("Retry asks again (and fails the same way)", () => panel.locator(".asst-trouble").count(), 1, { timeout: 20_000 });
    await panel.getByRole("button", { name: "New chat" }).click();
    await s.expect("New chat clears the alert and the log", async () => ({ trouble: await panel.locator(".asst-trouble").count(), q: await panel.locator(".asst-q").count() }), { trouble: 0, q: 0 });

    // a slow answer, stopped half way
    await q.fill("SLOW please");
    await q.press("Enter");
    await s.expect("a slow answer starts streaming (first chunk on screen)", () => panel.locator(".asst-a").innerText(), /^chunk 0/, { timeout: 15_000 });
    await s.expect("…while it streams the composer offers Stop instead of Send", async () => ({ stop: await panel.getByRole("button", { name: "Stop" }).count(), send: await panel.getByRole("button", { name: "Send" }).count() }), { stop: 1, send: 0 });
    await panel.getByRole("button", { name: "Stop" }).click();
    await s.expect("Stop gives Send back", async () => ({ stop: await panel.getByRole("button", { name: "Stop" }).count(), send: await panel.getByRole("button", { name: "Send" }).count() }), { stop: 0, send: 1 });
    const partial = await panel.locator(".asst-a").innerText();
    await sleep(1200);
    await s.expect("…the partial answer stays and stops growing", async () => ({ same: (await panel.locator(".asst-a").innerText()) === partial, partial: partial.startsWith("chunk 0") && !partial.includes("chunk 39") }), { same: true, partial: true });
    await s.expect("…and the question is still there", () => panel.locator(".asst-q p").allTextContents(), ["SLOW please"]);
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 15 ----------------------------------------------------------------- */
scenario("15-editor-keys", "editor behaviour: brackets, indent, comment, undo, search, autocomplete, folding", async (s) => {
  const { ctx, page } = await newPage(s);
  try {
    await openWorkspace(s, page);
    const typeable = page.locator(sel.editorContent);

    // undo / redo of a whole replacement (one history entry, so no timing involved)
    await setCode(page, CORRECT);
    await page.keyboard.press("Control+z");
    await s.expect("Ctrl+Z undoes the replacement back to the starter", () => codeOf(page), STARTER);
    await page.keyboard.press("Control+Shift+z");
    await s.expect("Ctrl+Shift+Z redoes it", () => codeOf(page), CORRECT);

    // typing, character by character
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Backspace");
    await s.expect("select-all + Backspace empties the editor", () => codeOf(page), "");
    await page.keyboard.type("foo(");
    await s.expect("typing '(' also inserts the closing ')'", () => codeOf(page), "foo()");
    await page.keyboard.type('"');
    await s.expect("typing a quote inside it closes the quote too", () => codeOf(page), 'foo("")');
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Backspace");
    await page.keyboard.type("def f(x):");
    await s.expect("closing bracket typed over the auto-inserted one: no duplicates", () => codeOf(page), "def f(x):");
    await page.keyboard.press("Enter");
    await s.expect("Enter after a colon indents by four spaces", () => codeOf(page), "def f(x):\n    ");
    await page.keyboard.type("return [x, (x + 1)]");
    await s.expect("nested brackets typed through leave one pair each", () => codeOf(page), "def f(x):\n    return [x, (x + 1)]");
    await page.keyboard.press("Control+/");
    await s.expect("Ctrl+/ comments the line out", () => codeOf(page), "def f(x):\n    # return [x, (x + 1)]");
    await page.keyboard.press("Control+/");
    await s.expect("Ctrl+/ again uncomments it", () => codeOf(page), "def f(x):\n    return [x, (x + 1)]");
    await s.expect("(the active line is highlighted)", () => page.locator(`${sel.code} .cm-activeLine`).count(), 1);
    await setCode(page, "x = 1\ny = x + x\n");
    await page.keyboard.press("Tab");
    await s.expect("Tab indents by four spaces", () => codeOf(page), "x = 1\ny = x + x\n    ");
    await page.keyboard.press("Shift+Tab");
    await s.expect("Shift+Tab takes it back", () => codeOf(page), "x = 1\ny = x + x\n");

    // search panel
    await page.keyboard.press("Control+f");
    await s.expect("Ctrl+F opens the search panel", () => page.locator(`${sel.code} .cm-panel.cm-search`).count(), 1);
    await page.keyboard.type("x");
    await s.expect("typing a term highlights its matches (x appears 3 times)", () => page.locator(`${sel.code} .cm-searchMatch`).count(), 3);
    await s.shot(page, "search-desktop-light");
    await page.keyboard.press("Escape");
    await s.expect("Escape closes the panel and not the workspace", async () => ({ panel: await page.locator(`${sel.code} .cm-panel.cm-search`).count(), ws: await page.locator(sel.dialog).count() }), { panel: 0, ws: 1 });

    // autocomplete
    await typeable.click();
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Backspace");
    await page.keyboard.type("pri");
    await s.expect("typing 'pri' pops the completion list, offering print", () => page.locator(".cm-tooltip-autocomplete li").allTextContents(), (l) => l.includes("print"), { timeout: 4000 });
    await s.shot(page, "autocomplete-desktop-light");
    await page.keyboard.press("Escape");
    await s.expect("Escape closes the list, keeps the text, keeps the workspace", async () => ({ tip: await page.locator(".cm-tooltip-autocomplete").count(), code: await codeOf(page), ws: await page.locator(sel.dialog).count() }), { tip: 0, code: "pri", ws: 1 });

    // folding
    await setCode(page, "def f():\n    x = 1\n    y = 2\nz = 3\n");
    await s.expect("a fold marker sits next to the def line (and the two indented lines are foldable together)", () => page.locator(`${sel.code} .cm-foldGutter span[title="Fold line"]`).count(), 1);
    await page.locator(`${sel.code} .cm-foldGutter span[title="Fold line"]`).first().click();
    await s.expect("folding hides the body behind a placeholder", async () => ({ ph: await page.locator(`${sel.code} .cm-foldPlaceholder`).count(), lines: await page.locator(`${sel.code} .cm-line`).evaluateAll((els) => els.map((e) => e.textContent)) }), { ph: 1, lines: ["def f():…", "z = 3", ""] });
    await s.shot(page, "folded-desktop-light");
    await page.locator(`${sel.code} .cm-foldPlaceholder`).click();
    await s.expect("clicking the placeholder unfolds it", () => codeOf(page), "def f():\n    x = 1\n    y = 2\nz = 3\n");

    // the 'error band' sits on a line number, and font size reaches the gutter too
    await s.expect("line numbers follow the document (5 lines: 4 + the empty last one)", () => gutterNumbers(page), ["1", "2", "3", "4", "5"]);
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 16 ----------------------------------------------------------------- */
scenario("16-assistant-window", "the floating assistant: drag by its header, resize by its corner, remembered, kept on screen", async (s) => {
  const { ctx, page } = await newPage(s, { storage: { "onsite-express-assistant-v1": JSON.stringify({ password: "pw-test" }) } });
  try {
    await openWorkspace(s, page);
    const panel = page.locator(sel.panel);
    const rect = () => panel.evaluate((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; });
    const spot = () => page.evaluate(() => JSON.parse(localStorage.getItem("onsite-express-assistant-v1") || "{}").spot ?? null);
    await page.keyboard.press("Control+k");
    await panel.waitFor({ state: "visible" });
    await s.expect("first open: bottom right, 400 x 560", rect, [856, 276, 400, 560]);

    // drag by the title
    const h = await page.locator(".asst-head h3").boundingBox();
    const gx = h.x + 5;
    const gy = h.y + 5;
    await page.mouse.move(gx, gy);
    await page.mouse.down();
    await page.mouse.move(gx - 120, gy - 60, { steps: 4 });
    await page.mouse.move(gx - 300, gy - 150, { steps: 4 });
    await page.mouse.up();
    await s.expect("dragging the header by (-300, -150) moves the window by exactly that", rect, [556, 126, 400, 560]);
    await s.expect("…and the new place is remembered", spot, { x: 556, y: 126, w: 400, h: 560 });

    // dragging from a button must not move it
    const x = await page.locator('.asst-head button[aria-label="Close the assistant"]').boundingBox();
    await page.mouse.move(x.x + 5, x.y + 5);
    await page.mouse.down();
    await page.mouse.move(x.x - 100, x.y + 100, { steps: 3 });
    await page.mouse.up();
    await s.expect("a press that starts on a header button does not drag (and does not close: it was released elsewhere)", async () => ({ rect: await rect(), open: await panel.isVisible() }), { rect: [556, 126, 400, 560], open: true });

    // resize by the corner (CSS resize: both), down to the 320 px minimum width
    const r = await rect();
    const cx = r[0] + r[2] - 4;
    const cy = r[1] + r[3] - 4;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 40, cy - 50, { steps: 4 });
    await page.mouse.move(cx - 80, cy - 100, { steps: 4 });
    await page.mouse.up();
    await s.expect("dragging the corner by (-80, -100) resizes to 320 x 460", rect, [556, 126, 320, 460]);
    await s.expect("…and the new size is remembered", () => spot(), { x: 556, y: 126, w: 320, h: 460 }, { timeout: 3000 });

    // a conversation inside the resized window
    const q = panel.getByLabel("Your question");
    await q.fill("Why does my code fail?");
    await q.press("Enter");
    await s.expect("the resized window works as before (a question is answered)", () => panel.locator(".asst-a").innerText(), "Use a hash map.", { timeout: 20_000 });
    await s.expect("(settle) the stream is over", () => panel.getByRole("button", { name: "Send" }).count(), 1, { timeout: 5000 });
    await s.shot(page, "moved-desktop-light");

    // kept on screen when the browser window shrinks (still above the 900px breakpoint)
    await page.setViewportSize({ width: 900, height: 500 });
    await s.expect("a 900 x 500 window pulls it up into view (y 126 -> 28), x unchanged", rect, [556, 28, 320, 460]);
    await page.setViewportSize({ width: 1280, height: 860 });
    await s.expect("growing the window again leaves it where it was pulled to", rect, [556, 28, 320, 460]);

    // below 900px it is a sheet, and it comes back as a window above it
    await page.setViewportSize({ width: 800, height: 600 });
    await s.expect("below 900px the same panel is a full-width bottom sheet", () => panel.evaluate((e) => { const r = e.getBoundingClientRect(); return { cls: e.className, x: Math.round(r.x), w: Math.round(r.width), bottom: Math.round(innerHeight - r.bottom), h: Math.round(r.height) }; }), { cls: "asst sheet", x: 0, w: 800, bottom: 0, h: 480 });
    await s.expect("the swap keeps the assistant mounted, so the conversation is still there", () => panel.locator(".asst-q").count(), 1);
    await page.setViewportSize({ width: 1280, height: 860 });
    await s.expect("above 900px again it is a window", () => panel.evaluate((e) => e.className), "asst float");

    // remembered across a reload (the saved spot, not the clamped one)
    await page.reload();
    await page.locator(sel.openBtn).first().click();
    await page.locator(sel.dialog).waitFor();
    await waitReady(page);
    await page.keyboard.press("Control+k");
    await panel.waitFor({ state: "visible" });
    await s.expect("after a reload it opens where it was left (556, 126, 320 x 460)", rect, [556, 126, 320, 460]);
    await s.expect("…on a fresh conversation (chats do not survive a reload)", () => panel.locator(".asst-q").count(), 0);
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 17 ----------------------------------------------------------------- */
scenario("17-assistant-markdown", "answers are rendered as markdown, safely", async (s) => {
  const { ctx, page } = await newPage(s, { storage: { "onsite-express-assistant-v1": JSON.stringify({ password: "pw-test" }) } });
  try {
    await openWorkspace(s, page);
    const panel = page.locator(sel.panel);
    await page.locator(sel.ask).click();
    const q = panel.getByLabel("Your question");
    await q.fill("MARKDOWN please");
    await q.press("Enter");
    await s.expect("the markdown answer arrives (a link in it)", () => panel.locator(".asst-a .md a").count(), 1, { timeout: 20_000 });
    await s.expect("(settle) the stream is over", () => panel.getByRole("button", { name: "Send" }).count(), 1, { timeout: 5000 });
    const md = panel.locator(".asst-a .md");
    await s.expect("**bold** becomes <strong>", () => md.locator("strong").allTextContents(), ["dict"]);
    await s.expect("the python fence is a <pre><code> with the exact source", () => md.locator("pre code").textContent(), "def two_sum(nums, target):\n    seen = {}  # value -> index\n    return seen");
    await s.expect("…highlighted: keywords, comment and the defined function", async () => ({
      kw: await md.locator("pre .hl-kw").allTextContents(),
      com: await md.locator("pre .hl-com").allTextContents(),
      def: await md.locator("pre .hl-fn.hl-def").allTextContents(),
    }), { kw: ["def", "return"], com: ["# value -> index"], def: ["two_sum"] });
    await s.expect("a bullet list of two items, the first with inline code", async () => ({ li: await md.locator("li").count(), code: await md.locator("li code").allTextContents() }), { li: 2, code: ["seen[x] = i"] });
    await s.expect("an https link becomes a new-tab link without a referrer", () => md.locator("a").evaluateAll((els) => els.map((a) => [a.textContent, a.getAttribute("href"), a.getAttribute("target"), a.getAttribute("rel")])), [["the docs", "https://docs.python.org/3/", "_blank", "noopener noreferrer"]]);
    await s.expect("a javascript: link is not a link at all, only its text", async () => ({ anchors: await md.locator('a[href^="javascript"]').count(), text: (await md.innerText()).includes("bad") }), { anchors: 0, text: true });
    await s.expect("raw HTML is shown as text, not run", async () => ({ script: await md.locator("script").count(), text: (await md.innerText()).includes("<script>alert(1)</script>") }), { script: 0, text: true });
    await s.expect("an image is replaced by its alt text (no request goes out)", async () => ({ img: await md.locator("img").count(), alt: (await md.innerText()).includes("pic") }), { img: 0, alt: true });
    await s.shot(page, "answer-desktop-light");
    await dark(page);
    await s.shot(page, "answer-desktop-dark");
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* 18 ----------------------------------------------------------------- */
scenario("18-runner-failure", "Python fails to load: badge, Retry, 'Nothing to run', recovery", async (s) => {
  const { ctx, page } = await newPage(s);
  try {
    let block = true;
    await ctx.route("**/pyodide/**", (route) => (block ? route.abort("failed") : route.continue()));
    await page.goto(BASE);
    await page.getByRole("navigation", { name: "Sections" }).getByRole("button", { name: "Line" }).click();
    await page.locator(sel.openBtn).first().click();
    await page.locator(sel.dialog).waitFor();
    await page.locator(".ws-runner.failed").waitFor({ timeout: 60_000 });
    await s.expect("the badge says 'Python failed to load'", () => page.locator(".ws-runner").textContent(), "Python failed to load");
    await s.expect("…and a Retry link appears beside it", () => page.locator(`${sel.code} .ws-toolbar .ws-linkbtn`).allTextContents().then((a) => a.map((x) => x.trim())), ["Retry", "Reset"]);
    await s.shot(page, "failed-toolbar-desktop-light", { locator: page.locator(`${sel.code} .ws-toolbar`), runner: false });

    await page.locator(sel.run).click();
    await page.locator(".ws-verdict").waitFor({ timeout: 60_000 });
    await s.expect("Run with no interpreter: 'Nothing to run' (bad) with the reason", () => verdictOf(page), (v) => v.tone === "bad" && v.title === "Nothing to run" && /^Python couldn't load: .+\. Check the connection and try again\.$/.test(v.detail));
    await s.expect("…the Run button comes back (nothing is stuck busy)", async () => ({ run: await page.locator(sel.run).count(), stop: await page.locator(sel.stop).count() }), { run: 1, stop: 0 });
    await s.expect("…and the badge still says failed", () => page.locator(".ws-runner").textContent(), "Python failed to load");

    block = false;
    await page.getByRole("button", { name: "Retry" }).click();
    await s.expect("Retry loads Python: the badge goes through to Ready", () => page.locator(".ws-runner").textContent(), "Ready", { timeout: 60_000 });
    await s.expect("…and Retry is gone", () => page.locator(`${sel.code} .ws-toolbar .ws-linkbtn`).allTextContents().then((a) => a.map((x) => x.trim())), ["Reset"]);
    await setCode(page, CORRECT);
    await startRun(s, page, "button");
    await s.expect("a run after the retry passes", () => verdictOf(page).then((v) => v.title), "Passed");
    finish(s);
  } finally {
    await ctx.close();
  }
});

/* ------------------------------ driver ------------------------------ */

runSuite({
  out: OUT,
  scenarios,
  makeScenario: (sc) => new WsScenario(sc.id, sc.title),
  setup: async () => {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, ignoreDefaultArgs: ["--hide-scrollbars"] });
  },
  teardown: () => browser.close(),
})
  .then((status) => process.exit(status))
  .catch((e) => {
    console.error("ws-regress crashed:", e);
    process.exit(2);
  });
