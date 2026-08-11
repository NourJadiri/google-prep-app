/* Structural parity: walk the rendered DOM of both apps and compare, element
 * for element, the things that define how it looks — box geometry to a
 * sub-pixel, and the computed styles that actually paint.
 *
 * This is the authoritative visual check. A raw pixel diff is not: Chromium
 * chooses between LCD-subpixel and greyscale text antialiasing based on
 * compositing state, so two DOMs that lay out and compute identically can
 * still rasterise glyph edges a few units apart depending on capture order.
 * Geometry plus computed styles has no such ambiguity.
 *
 * Usage:  node scripts/parity/computed.mjs        (needs the dev server up)
 */
import { chromium } from "playwright";

const REF = new URL("../../reference/onsite-express.html", import.meta.url).href;
const APP = process.env.APP_URL || "http://localhost:5173/";
const TABS = ["line", "metro", "dojo", "me"];
const IPHONE = { width: 390, height: 844 };

/* Properties that decide what a pixel ends up being. */
const PROPS = [
  "display", "position", "visibility", "opacity", "zIndex", "overflow",
  "color", "backgroundColor", "backgroundImage", "backgroundClip",
  "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
  "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor",
  "borderTopStyle", "borderRadius", "boxShadow", "outline",
  "fontFamily", "fontSize", "fontWeight", "fontStyle", "lineHeight",
  "letterSpacing", "textAlign", "textDecorationLine", "textTransform",
  "whiteSpace", "textOverflow", "fontVariantNumeric",
  "marginTop", "marginRight", "marginBottom", "marginLeft",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "flexDirection", "flexWrap", "justifyContent", "alignItems", "flexGrow",
  "flexShrink", "flexBasis", "gap", "gridTemplateColumns",
  "transform", "filter", "backdropFilter", "userSelect", "minHeight",
];

/* The port makes one deliberate change to the reference's CSS: transparent
   ::after overlays that lift the small round controls to a ~44px touch target.
   Those need `position: relative` on the control, which is the only computed
   difference they produce — nothing moves and nothing repaints. */
const TOUCH_TARGETS = [
  "pcheck", "golink", "ritual", "tbtn", "deck", "mbtn", "quit", "next",
];
const expected = (el, prop, refVal, appVal) =>
  prop === "position" &&
  refVal === "static" &&
  appVal === "relative" &&
  (TOUCH_TARGETS.some((c) => String(el.cls).split(/\s+/).includes(c)) ||
    (el.tag === "BUTTON" && /veil|dojo-log/.test(el.parentCls || "")));

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium",
});

async function walk(url, scheme) {
  const ctx = await browser.newContext({
    viewport: IPHONE,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: scheme,
  });
  const page = await ctx.newPage();
  const problems = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") problems.push(m.type() + ": " + m.text());
  });
  page.on("pageerror", (e) => problems.push("pageerror: " + e.message));

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  // Expand every day so the collapsed bodies are in scope too.
  const days = await page.$$eval(".dayhead", (els) => els.length);
  for (let i = 0; i < days; i++) {
    await page.$$eval(
      ".stn",
      (els, k) => {
        if (!els[k].classList.contains("open")) els[k].querySelector(".dayhead").click();
      },
      i
    );
  }
  await page.waitForTimeout(300);

  const snap = {};
  for (let i = 0; i < TABS.length; i++) {
    await page.locator(".tabs .tab").nth(i).click();
    await page.waitForTimeout(280);
    snap[TABS[i]] = await page.evaluate(
      ({ props }) => {
        const root = document.querySelector(".view.on") || document.querySelector("section.view");
        const out = [];
        const visit = (el, path) => {
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          const style = {};
          for (const p of props) style[p] = cs[p];
          // Text of this element only, excluding descendants.
          const own = [...el.childNodes]
            .filter((n) => n.nodeType === 3)
            .map((n) => n.textContent)
            .join("")
            .replace(/\s+/g, " ")
            .trim();
          out.push({
            path,
            tag: el.tagName,
            cls: el.className || "",
            parentCls: (el.parentElement && el.parentElement.className) || "",
            text: own,
            box: [
              +r.x.toFixed(2), +r.y.toFixed(2),
              +r.width.toFixed(2), +r.height.toFixed(2),
            ],
            style,
          });
          [...el.children].forEach((c, i) => visit(c, path + "/" + c.tagName + "[" + i + "]"));
        };
        if (root) visit(root, "root");
        return out;
      },
      { props: PROPS }
    );
  }

  // Header and tab bar live outside the views.
  for (const [key, sel] of [["__header", ".hdr"], ["__tabs", ".tabs"]]) {
    snap[key] = await page.evaluate(
      ({ sel, props }) => {
        const root = document.querySelector(sel);
        const out = [];
        const visit = (el, path) => {
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          const style = {};
          for (const p of props) style[p] = cs[p];
          const own = [...el.childNodes]
            .filter((n) => n.nodeType === 3)
            .map((n) => n.textContent)
            .join("")
            .replace(/\s+/g, " ")
            .trim();
          out.push({
            path, tag: el.tagName, cls: el.className || "",
            parentCls: (el.parentElement && el.parentElement.className) || "", text: own,
            box: [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)],
            style,
          });
          [...el.children].forEach((c, i) => visit(c, path + "/" + c.tagName + "[" + i + "]"));
        };
        if (root) visit(root, "root");
        return out;
      },
      { sel, props: PROPS }
    );
  }

  await ctx.close();
  return { snap, problems };
}

let failures = 0;
let compared = 0;
let allowed = 0;
const consoleLog = {};

for (const scheme of ["light", "dark"]) {
  const r = await walk(REF, scheme);
  const a = await walk(APP, scheme);
  consoleLog[`${scheme}/ref`] = r.problems;
  consoleLog[`${scheme}/app`] = a.problems;

  console.log(`\n=== ${scheme} ===`);
  for (const key of [...TABS, "__header", "__tabs"]) {
    const A = r.snap[key];
    const B = a.snap[key];
    const diffs = [];

    if (A.length !== B.length) {
      diffs.push(`element count: reference ${A.length}, port ${B.length}`);
    }
    const n = Math.min(A.length, B.length);
    for (let i = 0; i < n; i++) {
      const x = A[i];
      const y = B[i];
      compared++;
      if (x.tag !== y.tag) diffs.push(`${x.path}: tag ${x.tag} vs ${y.tag}`);
      if (x.text !== y.text) diffs.push(`${x.path}: text ${JSON.stringify(x.text)} vs ${JSON.stringify(y.text)}`);
      for (let k = 0; k < 4; k++) {
        if (Math.abs(x.box[k] - y.box[k]) > 0.01) {
          diffs.push(`${x.path}: box[${"xywh"[k]}] ${x.box[k]} vs ${y.box[k]}`);
        }
      }
      for (const p of PROPS) {
        if (x.style[p] === y.style[p]) continue;
        if (expected(y, p, x.style[p], y.style[p])) {
          allowed++;
          continue;
        }
        diffs.push(`${x.path} <${x.tag}.${x.cls}>: ${p} ${JSON.stringify(x.style[p])} vs ${JSON.stringify(y.style[p])}`);
      }
    }

    if (diffs.length === 0) {
      console.log(`  ${key.padEnd(9)} IDENTICAL (${A.length} elements)`);
    } else {
      failures += diffs.length;
      console.log(`  ${key.padEnd(9)} ${diffs.length} difference(s):`);
      diffs.slice(0, 25).forEach((d) => console.log(`      ${d}`));
      if (diffs.length > 25) console.log(`      … and ${diffs.length - 25} more`);
    }
  }
}

await browser.close();

console.log("\n=== console ===");
for (const [k, v] of Object.entries(consoleLog)) {
  console.log(`  ${k.padEnd(10)} ${v.length ? JSON.stringify(v) : "clean"}`);
}

console.log(`\n${compared} elements compared across ${PROPS.length} computed properties each`);
console.log(`${allowed} expected difference(s): position:relative for the 44px touch-target overlays`);
console.log("RESULT:", failures === 0 ? "PASS" : `FAIL (${failures} differences)`);
process.exit(failures === 0 ? 0 : 1);
