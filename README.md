# Onsite Express

A 7-day Google onsite study plan, ridden like a metro line. Graphs → backtracking → DP,
seven stations, terminus called GOOGLE.

Four tabs:

- **Line** — the week as a transit line in Google's four logo colours. Check problems, log
  the morning ritual, run the Day-7 mock clock.
- **Metro** — thumb-only quiz mode for the commute or the plane. 56 hand-written cards,
  ten stops a run, streaks multiply the XP. No typing, ever.
- **Dojo** — 15 algorithm templates, blurred until you've written yours from memory.
- **Me** — stats, the rank ladder, badges, export/import.

Everything runs offline. No network requests at runtime, no webfonts, no analytics.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the build
npm test         # vitest
```

Runtime dependencies are `react` and `react-dom`. Nothing else — no router (tabs are
component state), no CSS framework, no state library.

## Deploying to Cloudflare Pages

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**,
   and pick the repository.
3. Build settings:
   - **Framework preset**: `React (Vite)` — or set it manually:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: leave at the repo root
4. Save and deploy.

Pushes to `main` deploy to production; every other branch gets its own preview URL.

No `_redirects` file is needed — the app is a single route, so there is no client-side
routing for Pages to rewrite. `dist/` is fully static and can be hosted anywhere.

On an iPhone, **Share → Add to Home Screen** gives a standalone window: the
`apple-mobile-web-app-*` meta tags, `viewport-fit=cover` and the safe-area insets are all
in place.

## How it's put together

```
reference/onsite-express.html   the original single-file app — ground truth for all content
scripts/extract-data.mjs        slices its data <script> block into src/data
scripts/parity/                 harness that diffs this app against the reference

src/
  main.jsx
  App.jsx                       tab switch + layout
  styles/       tokens.css      the ported custom properties, light and dark
                base.css        reset, and the 44px touch-target overlays
                layout.css      page frame + classes more than one tab uses
  data/         plan.js         LC, XPD, RITUAL_XP, PLAN (7 days, 28 problems)
                questions.js    Q (56 cards), DECKS, CATN
                templates.js    TPL (15 templates in 3 groups)
                meta.js         RANKS, BADGES, RANKCOL
  lib/          engine.js       every rule, as pure functions
                storage.js      localStorage with an in-memory fallback
                dates.js        calendar-day helpers
  state/        AppState.jsx    Context + useReducer + persistence
                TimerProvider.jsx  the Day-7 mock clock, hoisted above the views
  components/   layout/ line/ metro/ dojo/ me/ shared/
```

### The engine is pure

`lib/engine.js` holds the rulebook. Mutators take the persisted state and return a new
state plus an ordered queue of celebrations:

```js
const { data, fx } = toggleProb(state.data, "ap", { today, now });
// fx: [{kind:"toast", msg:"+20 XP · All Paths From Source to…"},
//      {kind:"toast", msg:"⚡ Badge — First Blood", gold:true},
//      {kind:"confetti", n:12}]
```

Nothing in there reads the clock, the DOM or `localStorage` unless you hand it one —
callers inject `today`, `now` and `rng`. That is what makes the whole thing testable, and
why toasts and confetti fire in exactly the reference's order without a reducer ever
performing a side effect.

### Content is extracted, not retyped

Every problem, question, template, note and piece of microcopy comes out of
`reference/onsite-express.html` mechanically:

```bash
node scripts/extract-data.mjs      # rewrites src/data/{plan,meta,questions,templates}.js
```

`src/data/data.test.js` re-evaluates the reference's own `<script>` block on every test run
and asserts the ported modules still deep-equal it, so `src/data` can never quietly drift
from the original. `src/styles/css-parity.test.js` does the same for the stylesheet.

### Quiz options are always shuffled

Every card in `Q` stores its correct answer at `o[0]` — `a` is `0` for all 56. A run
therefore carries its own display permutation, redealt for each card:

```js
session.order            // e.g. [2, 0, 3, 1]
session.order[slot]      // the stored index sitting in the slot you tapped
```

Options are never rendered in stored order. `answerCard` compares `order[slot] === q.a`.

## State schema

The Me tab's export is literally `JSON.stringify(state.data)`, and `state.data` is exactly
this shape. It is compatible in both directions with the original single-file app: an
export from one imports cleanly into the other.

```json
{
  "v": 1,
  "xp": 0,
  "done": { "<problemId>": true },
  "rituals": { "<dayId>": "YYYY-MM-DD" },
  "quiz": {
    "answered": 0, "correct": 0,
    "perQ": { "<questionId>": { "seen": 0, "right": 0 } },
    "missed": ["<questionId>"],
    "bestStreak": 0, "sessions": 0, "perfect": 0, "bugRight": 0
  },
  "badges": { "<badgeId>": 1723190000000 },
  "streak": { "last": "YYYY-MM-DD", "cur": 0, "best": 0 }
}
```

`engine.normalize()` fills in anything a partial or older payload is missing and returns a
fresh state for anything that isn't a `v: 1` export. Persistence writes to `localStorage`
under `onsite-express-v1`, debounced 350 ms, with an in-memory fallback so a private
window or a cookie-blocked embed degrades instead of crashing.

## Rules, in one place

| | |
|---|---|
| XP | Easy 10 · Medium 20 · Hard 40 · Day-7 mock 30 · ritual 15 |
| Quiz XP | 2 per correct card, ×2 at streak ≥3, ×3 at ≥6, awarded silently |
| Perfect run | 10/10 on a full ten-card run: +20 XP, badge, confetti |
| Ranks | Wanderer 0 · Pathfinder 100 · Backtracker 250 · Memoizer 450 · Tabulator 700 · Pattern Oracle 1000 · Noogler 1350 |
| Streak | consecutive calendar days on which anything earned XP |
| Unchecking | refunds the same XP, silently; XP floors at 0; badges are never revoked |
| Deck weighting | weakest cards first: `(right+1)/(seen+2) + random()*0.55`, ascending |
| Mix deck | up to 3 Redemption cards + `ceil(remaining/2)` from the focus phase + the rest |
| Focus phase | Day 1 graphs · Days 2–3 backtracking · Days 4–6 DP · Day 7 none |

## Tests

```bash
npm test
```

66 Vitest specs, no browser needed:

- **`src/lib/engine.test.js`** — a perfect ten pays `2+2+4+4+4+6+6+6+6+6 = 46` XP plus the
  20 bonus; a wrong answer zeroes the run streak and books the card into Redemption while
  the best streak survives; rank thresholds promote exactly on the boundary; day
  completion and refund symmetry; the mix builder's focus-phase lean; `normalize()`
  round-trips a reference export.
- **`src/lib/dates.test.js`** — day arithmetic across month, year and leap-day boundaries.
- **`src/data/data.test.js`** — the ported content still deep-equals the reference.
- **`src/styles/css-parity.test.js`** — the split stylesheet still contains every rule.

### Parity harness

Four browser scripts compare this app against the reference side by side. They need
Chromium and are deliberately kept out of `package.json` — install them only when you want
to run them:

```bash
npm install --no-save playwright pngjs
npm run dev &                                # the scripts drive http://localhost:5173

node scripts/parity/computed.mjs     # authoritative: geometry + computed styles
node scripts/parity/roundtrip.mjs    # export from the reference, import here
node scripts/parity/behaviour.mjs    # timers, toasts, shuffling, import guards
node scripts/parity/screenshots.mjs  # side-by-side PNGs to flip between
```

`computed.mjs` is the one that matters: it walks both DOMs and compares every element's box
geometry to a sub-pixel plus 56 computed style properties, on all four tabs in both
palettes. Last run: **1398 elements identical**, the only differences being 180 deliberate
`position: relative` declarations that back the 44px touch-target overlays.

A raw pixel diff is deliberately *not* the verdict. Chromium chooses between LCD-subpixel
and greyscale text antialiasing based on compositing state, so two DOMs that lay out
identically can be bit-identical on one run and differ by a few units along glyph edges on
the next. Solid fills always match exactly. `screenshots.mjs` prints the counts for
context and judges on rendered text instead.

`CHROMIUM_PATH` and `APP_URL` override the browser binary and the dev-server URL.

## Departures from the reference

The port is at feature parity; these are the only intentional differences, none of which
change a pixel:

- **44px touch targets.** The 26px check circle and 34px link button keep their size but
  get a transparent `::after` overlay that brings the tappable area up to 44px.
- **Storage.** The reference's Claude-artifact storage branch is gone — there is no
  artifact host on Cloudflare Pages. Corrupt JSON in `localStorage` no longer downgrades
  the app to memory-only, and a `pagehide`/`visibilitychange` flush stops iOS from
  discarding the last 350 ms of debounced progress when it reclaims a backgrounded tab.
- **Clipboard.** The reference's export throws an unhandled rejection when clipboard
  permission is denied; here it's caught, and the textarea stays selected to copy by hand.
- **Favicon.** An inlined `data:` URI of the terminus dot, so the browser stops probing
  `/favicon.ico` and the console stays clean. Still no network request.

Anything else worth doing is written down in `FOLLOW-UPS.md` rather than built.
