# Onsite Express

A 14-day Google onsite study plan, ridden like a metro line. Week one: graphs →
backtracking → DP. Week two: heaps, windows, binary search, intervals, monotonic
stacks and the arrays-and-hashing staples. Fourteen stations, terminus called GOOGLE.

Four tabs:

- **Line** — the week as a transit line in Google's four logo colours. Check problems, log
  the morning ritual, run the Day-7 mock clock.
- **Metro** — thumb-only quiz mode for the commute or the plane. 120 hand-written cards,
  ten stops a run, streaks multiply the XP. No typing, ever.
- **Dojo** — 15 algorithm templates, blurred until you've written yours from memory.
- **Me** — stats, the rank ladder, badges, export/import, cloud sync.

Everything runs offline. No webfonts, no analytics, and the only network requests at
runtime are the optional cloud sync's — progress lives in localStorage first, and the
cloud copy is a mirror, never a dependency.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the build
npm run typecheck  # tsc, no emit
```

Runtime dependencies are `react` and `react-dom`, plus `jsqr` for the scanner and `qrcode`
for the square itself. No router (tabs are component state), no CSS framework, no state
library.

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
routing for Pages to rewrite. `dist/` is fully static and can be hosted anywhere; the
`functions/` directory is picked up by Pages automatically and only matters if you want
cloud sync (below).

## Cloud sync (optional, free tier)

Progress can mirror across devices through a Pages Function backed by Cloudflare D1.
One-time setup, all in the dashboard:

1. **Create the database**: dashboard → **Storage & Databases** → **D1** →
   **Create database** — any name, e.g. `onsite-express`.
2. **Bind it to the Pages project**: your Pages project → **Settings** → **Bindings**
   (older UI: Functions → D1 database bindings) → **Add** → type **D1 database**,
   variable name **`DB`**, pick the database. Add it for **Production** and **Preview**.
3. **Redeploy** (retry the latest deployment or push any commit) so the binding takes.

There is no schema step — the function creates its one table on first contact. The CLI
equivalent of step 1 is `npx wrangler d1 create onsite-express`; the binding still
happens in the project's settings.

Then, in the app: **Me → Sync → Turn on sync** on one device, and **I have a code →
Connect** with that code on the next. The code is the only credential — anyone holding
it can read and write that one blob, so treat it like the bearer token it is.

With both devices in front of you there is a second way round: **Me → Sync → Link by
QR** (the button reads **Link a device** once sync is on). The two modes are named for
what the device *showing* the code wants. **Get progress** is the fresh machine — it
puts a QR on screen, you scan it with the phone that has the progress, the phone's
consent card asks, and a poll tick later the progress is here; WhatsApp-Web-shaped.
Nothing is switched on until the other device actually writes, so a code nobody scans
leaves no row and no trace. **Send progress** is the mirror: this device holds the code
up and the device that scans adopts.

- **The QR is a plain link to the app** — `…/#sync=<code>&do=send|recv` — so a phone's
  own camera app is the scanner and there is nothing to install. The code rides in the
  fragment deliberately: it is a bearer token, and a fragment never reaches server logs.
- **No link ever acts on its own.** However a directive arrives — camera app, in-app
  scan, pasted code — it lands on the same consent card, which states what is about to
  be replaced in this device's own numbers and does nothing until you say yes.
- **A "Scan a code" button appears anywhere there's a camera** — `BarcodeDetector` where
  the browser has one (Chromium, so Android and most desktops), `jsqr` in the bundle
  everywhere else, Safari included. It is what lets a laptop read a phone's screen, and
  the only way into an iOS home-screen install. Where there is no camera at all — or an
  insecure origin, which hides the API — the camera-app route, the code printed under the
  square and the paste row cover it.

One iOS wrinkle: a home-screen install keeps its storage separate from Safari's, and iOS
gives a web app no way to make a scanned link open the installed copy — so a camera-app
scan lands in Safari, where the progress you meant to send may not be. Open the installed
app and use its own **Scan a code** instead: the camera works there (iOS 14.3 and up) and
the decoding rides in the bundle, so the whole exchange stays inside the copy that holds
the progress. Typing the code across still works and is the last resort. The consent card
says as much when it is asked to send from a device with nothing to send.

How it behaves:

- **Offline-first.** localStorage stays the source of truth; edits stamp a local
  timestamp and are pushed on a 4s debounce, on tab-hide, when the network returns, and
  on the next boot if the session ended offline.
- **Conflicts are last-write-wins on the whole blob**, judged server-side and
  atomically; the losing device adopts the winner. Two devices edited apart? The later
  save wins, the earlier one is gone.
- **Joining a code adopts the cloud copy** — export first if the joining device has
  progress worth keeping (the panel warns).
- **Without the binding** (or on a fork that never sets it up) the sync panel still
  renders, pushes fail quietly, and the app is exactly the local-only app it was.

Free-tier arithmetic: D1 allows 100k row writes/day and 5M reads/day; one keen day of
studying is a few hundred writes. Not a concern.

To develop against the function locally (`npm run dev` has no functions — sync just
reports the cloud as unreachable there):

```bash
npm run build
npx wrangler pages dev dist --d1=DB   # local Miniflare D1, no account needed
```

On an iPhone, **Share → Add to Home Screen** gives a standalone window: the
`apple-mobile-web-app-*` meta tags, `viewport-fit=cover` and the safe-area insets are all
in place.

## How it's put together

```
reference/onsite-express.html   the original single-file app — ground truth for all content
scripts/extract-data.mjs        slices its data <script> block into src/data
scripts/parity/                 harness that diffs this app against the reference

functions/api/state/[id].ts     the sync endpoint: one D1 row per code, last-write-wins

src/
  main.tsx
  App.tsx                       tab switch + layout
  types.ts                      the whole vocabulary: content, state, effects
  styles/       tokens.css      the ported custom properties, light and dark
                base.css        reset, and the 44px touch-target overlays
                layout.css      page frame + classes more than one tab uses
  data/         plan.ts         LC, XPD, RITUAL_XP, PLAN (14 days, 61 problems) — see below
                questions.ts    Q (120 cards), DECKS, CATN — hand-authored, see below
                templates.ts    TPL (15 templates in 3 groups)
                meta.ts         RANKS, BADGES, RANKCOL
  lib/          engine.ts       every rule, as pure functions
                storage.ts      localStorage with an in-memory fallback
                sync.ts         mirrors the blob to /api/state; offline-first
                link.ts         the link a QR carries: #sync=<code>&do=send|recv
                qr.ts           the QR matrix, via the qrcode package
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
- **`Action`** is a union over the reducer's sixteen cases, so `action.slot` exists only
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

### Content is extracted, not retyped — except where it has grown

The dojo's templates still come out of `reference/onsite-express.html` mechanically:

```bash
node scripts/extract-data.mjs      # rewrites src/data/templates.ts
```

The generator copies each literal byte for byte and adds only a type annotation on the
binding — `export const TPL: Template[] = [...]`. Annotating the binding is what
contextually types the data underneath it, so `diff:"M"` narrows to `Diff` and
`ph:"graphs"` to `Phase` without a character of the reference's content being rewritten.
Anything the generator emits without a declared type is an error, not an `any`.

The other three data files have grown past the reference by hand, and the generator
deliberately no longer writes them — regenerating would resurrect the 7-day app:

- `questions.ts` — the bank was hand-rebalanced after the port (the reference's cards
  let the longest option give the answer away 88% of the time) and extended from 56 to
  104 cards, then to 120 with the complexity-analysis set.
- `plan.ts` — week 2 (days 8–14) is hand-authored; week 1 is still the reference's,
  verbatim.
- `meta.ts` — the two station badges are re-worded for the 14-station line.

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
| XP | Easy 10 · Medium 20 · Hard 40 · timed mocks 30 · ritual 15 |
| Quiz XP | 2 per correct card, ×2 at streak ≥3, ×3 at ≥6, awarded silently |
| Perfect run | 10/10 on a full ten-card run: +20 XP, badge, confetti |
| Ranks | Wanderer 0 · Pathfinder 100 · Backtracker 250 · Memoizer 450 · Tabulator 700 · Pattern Oracle 1000 · Noogler 1350 |
| Streak | consecutive calendar days on which anything earned XP |
| Unchecking | refunds the same XP, silently; XP floors at 0; badges are never revoked |
| Deck weighting | weakest cards first: `(right+1)/(seen+2) + random()*0.55`, ascending |
| Mix deck | up to 3 Redemption cards + `ceil(remaining/2)` from the focus phase + the rest |
| Focus phase | Day 1 graphs · Days 2–3 backtracking · Days 4–6 DP · Days 8 & 12 heaps/stacks (ds) · all other days none |

## Verification

There is no unit-test suite — this is a personal app and the tests were removed on
purpose. What remains is the harness below, and it is the check that actually matters
here, because it compares against something real rather than asserting against
assumptions: it drives this app against `reference/onsite-express.html` in a real browser
and diffs the two.

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
- **Week two.** Days 8–14 are not in the reference: seven more hand-authored stations —
  heaps, sliding windows and two pointers, binary search on the answer, intervals,
  monotonic stacks, an arrays-and-hashing day straight off the top of the frequency
  list (Two Sum, 3Sum, Longest Consecutive Sequence, Subarray Sum Equals K), and a
  second timed mock. Problem picks are cross-checked against
  [liquidslr/leetcode-company-wise-problems](https://github.com/liquidslr/leetcode-company-wise-problems/tree/main/Google)'
  Google lists (30-day and 3-month CSVs, pulled 2026-08 — the same repo the timed mocks
  link to); each pattern day ramps easy → hard, and the week-2 warm-ups re-drill week-1
  patterns instead of seeding new ones. Station badges and the terminus copy now derive
  from `PLAN.length`, and the Line tab's content no longer matches the reference — the
  parity harness is ground truth for week 1 only.
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
