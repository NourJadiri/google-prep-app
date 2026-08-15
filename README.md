# Onsite Express

A 7-day Google onsite study plan, ridden like a metro line. Graphs → backtracking → DP,
seven stations, terminus called GOOGLE.

Four tabs:

- **Line** — the week as a transit line in Google's four logo colours. Check problems, log
  the morning ritual, run the Day-7 mock clock.
- **Metro** — thumb-only quiz mode for the commute or the plane. 120 hand-written cards,
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
npm run typecheck  # tsc, no emit
```

Runtime dependencies are `react` and `react-dom`. Nothing else — no router (tabs are
component state), no CSS framework, no state library.

Written in TypeScript under `strict` plus `noUncheckedIndexedAccess`. `npm run build`
typechecks before it bundles, so a type error fails the build rather than reaching Pages.

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
  main.tsx
  App.tsx                       tab switch + layout
  types.ts                      the whole vocabulary: content, state, effects
  styles/       tokens.css      the ported custom properties, light and dark
                base.css        reset, and the 44px touch-target overlays
                layout.css      page frame + classes more than one tab uses
  data/         plan.ts         LC, XPD, RITUAL_XP, PLAN (7 days, 28 problems)
                questions.ts    Q (120 cards), DECKS, CATN — hand-authored, see below
                templates.ts    TPL (15 templates in 3 groups)
                meta.ts         RANKS, BADGES, RANKCOL
  lib/          engine.ts       every rule, as pure functions
                storage.ts      localStorage with an in-memory fallback
                dates.ts        calendar-day helpers
  state/        AppState.tsx    Context + useReducer + persistence
                TimerProvider.tsx  the Day-7 mock clock, hoisted above the views
  components/   layout/ line/ metro/ dojo/ me/ shared/
```

### What the types are actually doing

`src/types.ts` holds every shape in one file, split into content (ported from the
reference, never mutated) and state (the persisted blob, which is also the export
format). Three of them carry real weight:

- **`Fx`** is a discriminated union of `ToastFx | ConfettiFx`. `Celebrations` splits the
  queue by `kind`, and a toast can no longer be handed to the confetti renderer.
- **`Action`** is a union over the reducer's fifteen cases, so `action.slot` exists only
  in `ANSWER` and a new case can't be added without handling it.
- **`PersistedData`** is the export format, so it is a compatibility promise. `normalize`
  is the only function in the app that takes `unknown`; everything downstream is real.

`noUncheckedIndexedAccess` is on, which matters more here than it sounds: `done`,
`rituals`, `badges`, `perQ`, `PROBS` and `Q_BY_ID` are all sparse maps keyed by ids that a
stale export can populate with anything. Every read has to admit it can miss. Where a
lookup genuinely cannot fail — the current rank, the terminus day — `PLAN` and `RANKS` are
typed as non-empty tuples so it resolves at compile time instead of with an assertion.

### The engine is pure

`lib/engine.js` holds the rulebook. Mutators take the persisted state and return a new
state plus an ordered queue of celebrations:

```ts
const { data, fx } = toggleProb(state.data, "ap", { today, now });
// fx: [{kind:"toast", msg:"+20 XP · All Paths From Source to…"},
//      {kind:"toast", msg:"⚡ Badge — First Blood", gold:true},
//      {kind:"confetti", n:12}]
```

Nothing in there reads the clock, the DOM or `localStorage` unless you hand it one —
callers inject `today`, `now` and `rng`. That is why toasts and confetti fire in exactly
the reference's order without a reducer ever performing a side effect.

### Content is extracted, not retyped — except the quiz bank

Every problem, template, note and piece of microcopy comes out of
`reference/onsite-express.html` mechanically:

```bash
node scripts/extract-data.mjs      # rewrites src/data/{plan,meta,templates}.ts
```

The generator copies each literal byte for byte and adds only a type annotation on the
binding — `export const PLAN: NonEmpty<Day> = [...]`. Annotating the binding is what
contextually types the data underneath it, so `diff:"M"` narrows to `Diff` and
`ph:"graphs"` to `Phase` without a character of the reference's content being rewritten.
Anything the generator emits without a declared type is an error, not an `any`.

`src/data/questions.ts` is the exception: the bank was hand-rebalanced after the port —
the reference's cards let the longest option give the answer away 88% of the time — and
extended from 56 to 104 cards, then to 120 with the complexity-analysis set. The
generator deliberately no longer writes that file; regenerating would resurrect the old
bank.

### Quiz options are always shuffled

Every card in `Q` stores its correct answer at `o[0]` — `a` is `0` for all 120. A run
therefore carries its own display permutation, redealt for each card:

```ts
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

## Verification

There is no unit-test suite — this is a personal app and the tests were removed on
purpose. What remains is the parity harness below, which is the check that actually
matters here: it compares this app against `reference/onsite-express.html` in a real
browser rather than asserting against assumptions.

`npm run build` typechecks first, so a type error fails the build.

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
- **The quiz bank.** In the reference's 56 cards the correct option was the longest 88%
  of the time — guessable without reading. All 56 were rebalanced (correct answers
  trimmed, distractors grown into specific, plausible misconceptions) and 48 new cards
  added, taking the bank to 104. The correct answer now lands at each length rank at
  chance level. Old card ids are unchanged, so existing per-card stats and exports
  carry over. A later pass added the complexity-analysis set (q105–q120): sixteen more
  `cx` cards, several of which quote the same Big-O on every option so that only the
  justification separates right from wrong — knowing the answer without the why scores
  nothing. The length discipline holds across the set: the correct option is
  (co-)longest 4 times in 16, exactly chance.
- **App icon.** The terminus dot as a roundel — the four logo colours ringing a dark
  tile — as a real icon set:
  `public/icon.svg` for the browser tab, a 180px PNG for iOS Add to Home Screen, and a
  `manifest.webmanifest` with 192/512 PNGs (plus a maskable variant) for Android installs.
  All same-origin static files — still nothing fetched off-site.
- **The visual-polish pass.** A deliberate break from pixel parity, made after the port:
  every emoji and text glyph doing UI work (tab icons, badges, checkmarks, chevrons,
  arrows, toast prefixes) was replaced with a shared inline-SVG icon set
  (`src/components/shared/Icon.tsx`), and controls gained hover/press states, tabular
  numerals and small state refinements. Content, layout structure, tokens and behaviour
  are unchanged, but `computed.mjs` and `screenshots.mjs` now report real differences on
  the restyled surfaces — the reference is still ground truth for *content*, no longer
  for every pixel.

Anything else worth doing is written down in `FOLLOW-UPS.md` rather than built.
