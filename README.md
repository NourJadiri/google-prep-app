# YALC

**Y**et **A**nother **L**eetCode **C**lone. Interview prep ridden like a metro line — two
lines, one app, and a Python editor in every problem.

- **Onsite Express** (Google): a 24-day onsite study plan.
- **Day One Local** (Amazon): the slow train — thirteen stops through Seattle, one idea
  per stop, LeetCode Easy only, no timetable.

Every problem on both lines opens in the **workspace**: an original statement, a
CodeMirror editor, and tests that run in your browser on real CPython (Pyodide) — Run
for the examples, Submit for the full hidden suite, and a clean sweep ticks the
problem. No LeetCode tab needed, premium or not.

The Google line, in detail: Days 1–10: paths →
backtracking → DP → heaps, windows, binary search. Days 11–24, the Google
fortnight, built as multi-day arcs rather than one pattern a day: five days of
graphs (BFS, connected components, union-find, topological order, Dijkstra,
state graphs and the bitmask TSP), three of DP (knapsack, strings, grids), two
of hard trees, then the staples, monotonic stacks, a design day and a final
re-drill day. Five problems a day, Google-tagged picks, and every day ends with
a warm-up re-drilling an older pattern so nothing rots. Twenty-four stations,
terminus called GOOGLE.

The premium classics — Meeting Rooms II, Alien Dictionary, Graph Valid Tree,
Walls and Gates, Number of Islands II, Android Unlock Patterns, Longest
Substring with At Most K Distinct, Design Hit Counter — ride along as in-app
drills: original re-statements of the same tasks (own wording, own worked
examples, follow-ups an interviewer would ask). Like every other problem they
open in the workspace, with tests — for these there is no LeetCode page to fall
back on.

The Local's stops: Pike Place (hash maps), Pioneer Square (strings), Ballard Locks
(two pointers), Fremont (running state and windows), Union Station (stacks and
queues), Monorail (linked lists), Space Needle (binary search), Discovery Park and
the Arboretum (trees), Smith Tower (heaps), Puget Sound (grids and graphs), Mount
Rainier (first DP), Doppler (bits and math) — terminus DAY ONE. 55 problems, each
stop opening with a short note on its one idea.

Four tabs:

- **Line** — the line you're riding, and the picker that switches trains. Google's
  in its four logo colours, the Local in orange; switching retints the whole app.
  Check problems, open any of them in the workspace, log the morning ritual, run the
  mock clocks on days 7, 18, 22 and 24.
- **Metro** — thumb-only quiz mode for the commute or the plane. 120 hand-written cards,
  ten stops a run, streaks multiply the XP. No typing, ever.
- **Dojo** — 15 algorithm templates, blurred until you've written yours from memory.
- **Me** — the line's stats, its rank ladder (Wanderer to Offer Letter, or Applicant to
  Day One), badges, export/import, cloud sync.

Each line keeps its own progress, XP and ranks; the streak, the metro card stats and
the badge case are shared, because studying is studying whichever train you're on.

Nothing is fetched from another origin. No webfonts, no analytics; the network
requests at runtime are the optional cloud sync's, the optional assistant's (to this
origin's own Worker, which is what talks to Anthropic), the problem you open, and —
the first time you open one — the Python interpreter, served from this same origin and
cached for good after that. Progress lives in localStorage first, and the cloud copy
is a mirror, never a dependency.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the build
npm run typecheck  # tsc, no emit
npm run problems   # validate the problem bank in the real interpreter (below)
```

Runtime dependencies are `react` and `react-dom`, `jsqr` for the scanner and `qrcode`
for the square, CodeMirror 6 (`codemirror` and the `@codemirror/*` packages it is made
of) for the editor, `marked` for problem statements, and for the assistant the AI SDK
(`ai`, `@ai-sdk/react`) in the browser and Anthropic's SDK (`@anthropic-ai/sdk`) in the
Worker. `pyodide` is a dev dependency:
the build copies the interpreter out of it and serves it as static files (below), so
none of it is bundled. No router (tabs are component state), no CSS framework, no state
library. The workspace is its own lazy chunk: the line loads as light as it always did.

Written in TypeScript under `strict` plus `noUncheckedIndexedAccess`. `npm run build`
typechecks before it bundles, so a type error fails the build rather than reaching Cloudflare.

## Deploying to Cloudflare Workers

The app is one Worker with static assets: `dist/` is served as files, and the Worker in
`worker/` only answers `/api/*`, for cloud sync and the assistant (both below).
`wrangler.jsonc` at the repo root holds the whole config: the name, the assets directory,
the entry point and the D1 binding. Only the assistant's two secrets live outside it, in
the dashboard. `wrangler deploy` reads it, and so does the dashboard's Git integration.

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Workers** →
   **Import a repository**, and pick the repository. (Already created? The same
   settings live under the Worker → **Settings** → **Build**.)
3. Build settings:
   - **Build command**: `npm run build`. Required: wrangler uploads `dist/` as is and
     fails if it doesn't exist.
   - **Deploy command**: `npx wrangler deploy`
   - **Non-production branch deploy command**: `npx wrangler versions upload`
   - **Root directory**: leave at the repo root
4. Save and deploy.

The Worker's name in the dashboard must match `name` in `wrangler.jsonc` (`yalc`), or
the build fails. Pushes to `main` deploy to production; other branches upload a version
with its own preview URL and don't touch production. A preview is a version of the same
Worker, so it shares production's D1 database (syncing from one writes real rows) and
its secrets (the assistant, below).

From a terminal instead: `npx wrangler login`, then `npm run build && npx wrangler deploy`.

No `_redirects` file is needed — the app is a single route, so there is no client-side
routing to rewrite, and a path with no file behind it is a plain 404. `dist/` is fully
static and can be hosted anywhere; the Worker only matters if you want cloud sync.

`public/_headers` ships two rules with the build:

- **Cross-origin isolation** (`Cross-Origin-Opener-Policy: same-origin` +
  `Cross-Origin-Embedder-Policy: require-corp`) on every path. It is what lets the
  editor's Stop button and time limits interrupt Python through a shared buffer
  instead of throwing the interpreter away. The app loads nothing cross-origin, so
  `require-corp` blocks nothing. Off a host that ignores `_headers`, everything still
  works — a timeout just costs a two-second reload of the interpreter.
- **Immutable caching for `/pyodide/*`.** The interpreter (about 13 MB: a 9.6 MB wasm,
  the 2.5 MB standard library, the loader) lives under its version number,
  `/pyodide/314.0.7/`, so a path never changes content and moves once per upgrade.
  Every file is under Workers' 25 MiB per-asset limit.

## Cloud sync (optional, free tier)

Progress can mirror across devices through the Worker, backed by Cloudflare D1.
`wrangler.jsonc` binds it as `DB` to the database whose `database_id` it names, so the
only setup is a database to point at:

1. **Create the database**: dashboard → **Storage & Databases** → **D1** →
   **Create database** — any name, e.g. `yalc` — or `npx wrangler d1 create yalc`.
2. **Point the config at it**: put its ID in `database_id` under `d1_databases` in
   `wrangler.jsonc`, and push. The next deploy carries the binding.

There is no schema step — the Worker creates its one table on first contact. Don't add
the binding in the dashboard as well: `wrangler.jsonc` is the source of truth, and each
deploy replaces whatever bindings the dashboard holds with the ones it lists. A fork
without a database of its own should delete the `d1_databases` block; sync then reports
the cloud as unreachable and everything else works.

Then, in the app: **Me → Sync → Turn on sync** on one device, and **I have a code →
Connect** with that code on the next. The code is the only credential — anyone holding
it can read and write that one blob, so treat it like the bearer token it is.

With both devices in front of you there is a second way round: **Me → Sync → Link a
device**, which opens a full-screen sheet with the square on it. Everything about
linking is in that sheet — the mode, the QR, the code, the paste box, the way through
to the camera — so the panel behind it stays three buttons wide.

The sheet's two modes are named for what the device *showing* the code wants. **Get
progress** is the fresh machine — it puts a QR up, you scan it with the phone that has
the progress, the phone's consent card asks, and a poll tick later the progress is here;
WhatsApp-Web-shaped. Nothing is switched on until the other device actually writes, so a
code nobody scans leaves no row and no trace. **Send progress** is the mirror: this
device holds the code up and the device that scans adopts.

The sheet is also the waiting room. While it is open, a Get-mode device is watching the
cloud for the other one; close it and it stops watching, which is the honest reading of
a screen you have walked away from. Leave it up until the two devices have found each
other — the sheet says "Linked" and closes itself when they do.

- **The QR is a plain link to the app** — `…/#sync=<code>&do=send|recv` — so a phone's
  own camera app is the scanner and there is nothing to install. The code rides in the
  fragment deliberately: it is a bearer token, and a fragment never reaches server logs.
- **No link ever acts on its own.** However a directive arrives — camera app, in-app
  scan, pasted code — it lands on the same consent card, which states what is about to
  be replaced in this device's own numbers and does nothing until you say yes.
- **"Scan a code instead", at the foot of the sheet, appears anywhere there's a
  camera** — `BarcodeDetector` where the browser has one (Chromium, so Android and most
  desktops), `jsqr` in the bundle everywhere else, Safari included. It is what lets a
  laptop read a phone's screen, and the only way into an iOS home-screen install. Where
  there is no camera at all — or an insecure origin, which hides the API — the camera-app
  route, the code printed under the square and the paste row cover it.

One iOS wrinkle: a home-screen install keeps its storage separate from Safari's, and iOS
gives a web app no way to make a scanned link open the installed copy — so a camera-app
scan lands in Safari, where the progress you meant to send may not be. Open the installed
app and use **Link a device → Scan a code instead**: the camera works there (iOS 14.3 and up) and
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

**The schema maintains itself, migrations included.** Version 2 of the export split
progress by line (below), and the table grew two columns to match: `v`, the blob's
schema version, and `track`, the line it was last riding. The function reads exactly
those two labels off each blob it stores, and nothing else. A table created by an
earlier deploy gets the columns on its first request after this one (`no such column`
→ `ALTER TABLE` → retry), with every existing row back-filled as what it is — a v1
blob on the Google line. There is still no schema step to run.

The `v` column is the safety catch for the deploy itself: a tab left open across it
still runs the v1 build, and its next push would otherwise replace a v2 blob — and the
Local's progress with it — just by carrying a newer timestamp. The upsert refuses any
write whose schema is older than the row's; the stale tab is handed the v2 copy, can't
read it, and parks until it reloads into a build that can.

Free-tier arithmetic: D1 allows 100k row writes/day and 5M reads/day; one keen day of
studying is a few hundred writes. Not a concern.

To develop against the Worker locally (`npm run dev` has no Worker — sync just reports
the cloud as unreachable there):

```bash
npm run build
npx wrangler dev   # wrangler.jsonc's bindings, with a local Miniflare D1; no account needed
```

On an iPhone, **Share → Add to Home Screen** gives a standalone window: the
`apple-mobile-web-app-*` meta tags, `viewport-fit=cover` and the safe-area insets are all
in place.

## The assistant (optional, Anthropic API)

Press `⌘K` (`Ctrl+K`) in the workspace, or **Ask** in its header, and a small window
floats over the editor: ask about syntax, your approach or a bug, and Claude Haiku 5.5
answers with the problem, your code and your last run already in front of it. It needs
an Anthropic API key, which lives only in Cloudflare, and a password, which keeps
everyone else out. One-time setup:

1. **Anthropic Console** (console.anthropic.com): create a workspace for this app (say
   `yalc`), set its **monthly spend limit** low — $5 is plenty — and create
   an API key inside it. A Claude.ai subscription doesn't cover API calls; the key
   spends the Console's own credit.
2. **Make a password**: anything long and random, e.g. `openssl rand -base64 32`.
3. **Cloudflare**: your Worker → **Settings** → **Variables and Secrets** → add
   `ANTHROPIC_API_KEY` and `ASSISTANT_PASSWORD`, both of type **Secret**, and deploy.
   Or from a terminal: `npx wrangler secret put ANTHROPIC_API_KEY`, then the same for
   `ASSISTANT_PASSWORD`. Either way they take effect at once, with no rebuild, and later
   deploys leave them alone. Make them secrets, not plain-text variables: a deploy
   deletes any variable that `wrangler.jsonc` doesn't list.
4. **In the app**: open any problem, press `⌘K`, paste the password. That browser
   remembers it; do the same once on each device.

How it stays yours:

- **The key never leaves Cloudflare.** It is a Worker secret, and
  `worker/assistant/` is the only code that reads it — never in the bundle (it is not
  a `VITE_` variable, which Vite would bake into the public JavaScript), never in git,
  never in a browser.
- **The Worker is the door, and the password its lock.** Every request carries the
  password as a bearer token, compared in constant time; a wrong one gets a 401 before
  anything is spent. It is a separate secret from the sync code on purpose: sync codes
  ride in QR codes and links, and seeing one shouldn't let anyone spend money.
- **It fails closed.** Without both secrets (a fork, a fresh Worker, `wrangler dev`
  without a `.dev.vars`), the endpoint answers 503 and calls nothing. Preview URLs are
  the exception: a Worker's secrets go with every version of it, previews included, so
  on a preview the password is the whole door. `"preview_urls": false` in
  `wrangler.jsonc` turns previews off if you'd rather have none.
- **It isn't a proxy.** The browser sends the problem and the conversation, nothing
  else. The model, the token cap, the effort and the system prompt are fixed in the
  Worker, so even a leaked password buys a chat with Haiku about Python — never the
  key, never a bigger model.
- **The spend limit is the backstop.** If everything above failed at once, the
  workspace's monthly cap is the most it could cost. If the password leaks, change the
  secret (it takes effect at once); if the key does, revoke it in the Console.
- **Answers can't run code in the page.** They are rendered by their own `marked`
  instance (`renderAnswer.ts`) that shows raw HTML as text, never loads an image (a markdown
  image is a request to whatever URL the text names), and links only to http(s).

Each question takes along a snapshot of your code when it changed since the last one,
and the latest run's report when it's new, so the conversation reads like a pairing
session and stays append-only. The chat lives in the tab: closing the window keeps it,
a new problem starts a fresh one, and nothing about it syncs. Haiku 5.5 costs $0.10
per million input tokens and $0.50 per million output, so a question with its problem,
code and a few turns of history comes to well under a tenth of a cent.

To run it locally, put the two secrets in a `.dev.vars` file at the repo root (it is
gitignored, as is `.env*`) and serve the build through wrangler:

```bash
printf 'ANTHROPIC_API_KEY=sk-ant-...\nASSISTANT_PASSWORD=...\n' > .dev.vars
npm run build
npx wrangler dev
```

`npm run dev` has no Worker, so there the window says the endpoint is missing. An
optional third variable, `ANTHROPIC_BASE_URL`, points the Worker somewhere other than
api.anthropic.com — Cloudflare AI Gateway for logs and analytics, or a local mock. It
isn't secret: in production it goes under `vars` in `wrangler.jsonc`, locally in
`.dev.vars`.

## The workspace: Python in the browser

Open any problem from its row (the `</>` button) and the workspace takes the whole
screen. From 900px up it's LeetCode's three panes — statement left, editor over tests
right, both splits draggable and remembered; on a phone it's one pane at a time behind
a Problem / Code / Tests switch.

- **The editor** is CodeMirror 6 with Python highlighting, autocomplete, bracket
  matching and search, themed from the app's own tokens (light, dark, and the line's
  accent). Your code is saved per problem as you type, in this browser only
  (`lib/drafts.ts`) — drafts never sync and never land in an export.
- **Run** (`⌘/Ctrl+Enter`) tries the cases in the Testcase tab — the statement's
  examples to start with. Edit one or add your own: anything typed in is answered by
  the problem's reference solution, so you get an expected output for inputs nobody
  wrote down. **Submit** (`⌘/Ctrl+Shift+Enter`) runs every test, hidden ones included;
  when they all pass, the problem is ticked exactly as the check circle would tick it —
  XP, station clears, badges — and the solution opens.
- **Results** read like LeetCode's: a verdict (Accepted, Wrong Answer, Runtime Error,
  Time Limit Exceeded, Syntax Error), one chip per test, and for each the input, your
  output against the expected one, whatever you printed, and a traceback trimmed to
  your own lines. The editor marks the line an error came from.
- **The Solution tab** holds a walkthrough and a reference solution, veiled until you
  ask — or until every test passes.
- **Copy for Claude** puts the statement, your current code and the last failing case
  on the clipboard, with an instruction that makes Claude an interviewer rather than
  an answer key.
- **Ask** (`⌘K` / `Ctrl+K`) floats a small chat over the workspace for quick
  questions — syntax, your approach, a bug — answered by Claude Haiku 5.5. It sees the
  problem, your code and your last run without being told. Optional; setup below.
- A quiet **stopwatch** starts when the workspace opens. Tap to pause.

How it runs:

- **Pyodide** — CPython 3.14 compiled to WebAssembly — loads in a module Web Worker
  (`src/runner/worker.ts`) the first time a workspace opens: about 13 MB once, a couple
  of seconds after that. It's self-hosted: `vite.config.ts` serves it from
  `node_modules/pyodide` in dev and emits it into `dist/pyodide/<version>/` at build.
- **The judge** is one Python file, `src/runner/harness.py`. It gives your code
  LeetCode's environment (`List`, `Optional`, `collections`, `heapq`, `bisect`… already
  imported; `ListNode` and `TreeNode` defined; a fresh `Solution()` per test), converts
  arrays to linked lists and trees and back, compares answers (order-insensitive where
  the problem says so, floats to 1e-5, `true` never equal to `1`), captures stdout, and
  streams each test's result back the moment it finishes.
- **Time limits** live on the main thread (`src/runner/runner.ts`), since a worker busy
  in `while True:` can't watch a clock. Each test gets four seconds, unless its problem
  sets a tighter limit to separate a quadratic answer from a linear one. When one runs
  out — or you press Stop — the runner raises a `KeyboardInterrupt` inside Python
  through a shared interrupt buffer, and the interpreter stays warm; if Python doesn't
  come back within a second (or the page isn't cross-origin isolated), the worker is
  replaced. Either way, every test that finished is already on the main thread.
- **The browser's stack is the one real limit.** Plain recursion is fine past 10,000
  levels; `@cache` and `@lru_cache` are swapped for pure-Python versions so top-down
  DP is too; long linked lists and trees are taken apart node by node after each test
  so freeing them can't nest. Recursion that runs through C — a generator expression,
  `map()`, `sorted(key=…)` inside a deep recursive call — can still blow the stack
  around 500 levels deep. That crashes the interpreter, which the runner replaces,
  reporting the crash on the test that caused it. The problem bank keeps its inputs
  inside these limits.

## The problem bank

`src/data/problems/` holds every problem the workspace can open — 151 of them: the
Local's 55, the Google line's 99 LeetCode problems and its 8 premium drills, with the
11 the lines share written once. One directory per problem, named by its LeetCode slug
(or drill id):

```
statement.md   the problem in our own words — never LeetCode's text or examples
spec.json      signature, starter code, and 15–30 tests, a few marked as examples
solution.py    the reference solution, shown in the Solution tab
notes.md       the walkthrough shown with it
judge.py       custom input building or checking, when an answer isn't unique
brute.py       an independent, obviously-correct solution  ┐ validator only,
wrong.py       a plausible bug the tests must catch        ┘ never bundled
```

Each file loads lazily when its problem opens. `npm run problems` validates the bank
in the very interpreter the browser runs: every reference solution must pass every
test inside a third of its time limit, the starter must fail, `brute.py` must agree
on every expected value, `wrong.py` must be caught, and a shown example typed back in
must reproduce itself. `src/data/problems/AUTHORING.md` is the full contract for
writing one.

## How it's put together

```
reference/onsite-express.html   the original single-file app — ground truth for all content
scripts/extract-data.mjs        slices its data <script> block into src/data
scripts/parity/                 harness that diffs this app against the reference
scripts/regress/                regression checks (workspace; Me tab + sync; study tabs + shell):
                                scripted sessions + screenshots

scripts/problems/               validate.mjs (the bank's validator), specfmt.py (spec writer)

worker/index.ts                 the Worker's router: /api/state/<code> and /api/assistant
worker/sync.ts                  the sync endpoint: one D1 row per code, last-write-wins,
                                self-migrating schema, refuses schema downgrades
worker/assistant/               the assistant endpoint: password gate, request checks, the
                                prompt, the only holder of the Anthropic key, the stream back
worker/http.ts                  the no-store JSON both endpoints answer with
wrangler.jsonc                  the Worker: dist/ as static assets, the D1 binding
public/_headers                 cross-origin isolation + immutable /pyodide/* caching

src/
  main.tsx
  App.tsx                       the page: header, the current tab's view, tab bar,
                                the workspace when a problem is open, celebrations
  app/          views.ts        which view each tab shows
                hooks/          useTrackTheme: tints the app for the line
                WorkspaceHost   lazy-loads the workspace modal
  types.ts                      the whole vocabulary: content, state, effects
  styles/       tokens.css      the custom properties, light and dark, per line
                base.css        reset, and the 44px touch-target overlays
                layout.css      page frame and the hero type every tab uses; each
                                component imports its own CSS file next to it
  data/         plan.ts         the Google line: LC, XPD, RITUAL_XP, PLAN (24 days)
                aws.ts          the Local: AWS_PLAN (13 stops, 55 problems)
                tracks.ts       TRACKS — each line's plan, ranks, badges, copy — and the
                                cross-line problem/station indexes
                questions.ts    Q (120 cards), DECKS, CATN — hand-authored, see below
                templates.ts    TPL (15 templates in 3 groups)
                meta.ts         RANKS, AWS_RANKS, BADGES, RANKCOL
                problems/       the problem bank (above); index.ts loads it lazily
  runner/       harness.py      the judge, in Python
                worker.ts       Pyodide in a module worker
                runner.ts       one run at a time, time limits, Stop, crash recovery
                types.ts        the wire format between the three
  lib/          engine.ts       every rule, as pure functions
                storage.ts      localStorage with an in-memory fallback
                drafts.ts       your code per problem, and workspace prefs — local only
                cx.ts           class-name joiner; platform.ts: Mac or not, ⌘ or Ctrl
                sync/           mirrors the blob to /api/state, offline-first: config,
                                status store, remote calls, the push/pull engine, and
                                the verbs the Me tab uses (enable, join, claim…)
                syncCode.ts     what a sync code looks like; link.ts: the link a QR
                                carries, #sync=<code>&do=send|recv
                dates.ts        calendar-day helpers; motion.ts: reduced motion;
                                scroll.ts: back to the top on tab and line changes
  state/        AppState.tsx    Context + useReducer + persistence
                TimerProvider.tsx  the Day-7 mock clock, hoisted above the views
  hooks/        shared by more than one area: useMedia, useLatest, useCopied,
                useCopyToast, useDialogBehavior (focus in and out, Escape), useTrack
                (the current line, its progress and today's day)
  components/   ui/             shared primitives: Button, IconButton, LinkButton, Tabs,
                                SegmentedControl, StatusDot, Badge, Spinner, Spacer,
                                PillButton, ButtonRow, Section, Note, Dialog, Tag,
                                DifficultyTag, XpValue
                layout/         Header (RankBadge, HeaderStats, XpBar, XpCaption) and
                                TabBar (TabButton; lib/tabs.ts lists the tabs)
                line/           the Line tab: LinePicker, LineHero, TransitLine of
                                Stations, each a DayCard (head, progress, problem and
                                ritual rows), MockTimer, Terminus
                metro/          the quiz tab: picker/ (departure board of decks),
                                quiz/ (card, options, stops track), result/; each
                                keeps its pure logic in lib/ (deck looks, option states)
                dojo/           the templates tab: groups of TemplateCards, ritual log
                shared/         Icon/ (the SVG set, glyph data in glyphs/ by family),
                                celebrations/ (toasts and confetti, queue and timing
                                in hooks/ and lib/), CodeBlock
                me/             the Me tab: stats/, ladder/, badges/, data/, and sync/
                                (the panel), link/ (the link sheet, consent card, QR),
                                scan/ (the camera scanner), each with hooks/ and lib/
                workspace/      the editor modal: Workspace (the shell) and WorkspaceBody,
                                header/, layout/, problem/, editor/, console/, plus
                                hooks/ (draft, prefs, run session, shortcuts…) and
                                lib/ (run plan, verdicts, Copy for Claude, markdown)
                assistant/      the ⌘K window: components, hooks/ (chat, password,
                                floating box…) and lib/ (messages, storage, safe answers)
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
this shape — version 2, which split progress by line:

```json
{
  "v": 2,
  "track": "google",
  "tracks": {
    "google": {
      "xp": 0,
      "done": { "<problemId>": true },
      "rituals": { "<dayId>": "YYYY-MM-DD" },
      "accepted": { "<problemId>": 1723190000000 }
    },
    "aws": { "xp": 0, "done": {}, "rituals": {}, "accepted": {} }
  },
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

`track` is the line on screen — synced, because it's where you are rather than a
setting. `accepted` records when every test of a problem first passed in the
workspace; it outlives unticking, because it happened. Two optional keys appear only after
an untick took something back: `peak`, the XP held before it cost a rank, and
`uncleared`, the stations it opened again. They keep ticking it back in from replaying
the rank-up and the station clear, and they go away once caught up with. Problem and station ids are
unique across lines (short ids on the Google line, slugs on the Local), so a stale id
can never land on the wrong one.

Every v1 export still imports — the original single-file app's included.
`engine.normalize()` upgrades it on the way in: v1 kept `xp`, `done` and `rituals` at the
top level, and all of it was the Google line's, so it becomes `tracks.google` and the
Local starts empty. Otherwise `normalize()` fills in anything a partial payload is
missing and returns a fresh state for anything that isn't a v1 or v2 export. Persistence writes to `localStorage`
under `onsite-express-v1` (the app's name before it was YALC, kept so saved progress
survives the rename), debounced 350 ms, with an in-memory fallback so a private
window or a cookie-blocked embed degrades instead of crashing.

## Rules, in one place

| | |
|---|---|
| XP | Easy 10 · Medium 20 · Hard 40 · timed mocks 30 · ritual 15 |
| Quiz XP | 2 per correct card, ×2 at streak ≥3, ×3 at ≥6, awarded silently |
| Perfect run | 10/10 on a full ten-card run: +20 XP (counted in the run's XP), badge, confetti. A shorter Redemption run can't be perfect |
| Run result | Solid from 70% right, rounded (so 2 of 3); Rough below |
| Ranks (Google) | Wanderer 0 · Pathfinder 100 · Backtracker 250 · Memoizer 450 · Tabulator 700 · Pattern Oracle 1000 · Noogler 1350 · Graph Whisperer 1800 · DP Sensei 2250 · Offer Letter 2750 |
| Ranks (Local) | Applicant 0 · Online Assessment 40 · Phone Screen 100 · On the Loop 180 · Bar Raiser 280 · Offer Extended 400 · Day One 560 |
| Lines | XP, ticks, rituals and ranks are per line; quiz XP goes to the line on screen; the streak, card stats and badges are shared |
| Accepted | a Submit where every test passes ticks the problem (if it wasn't) with the usual XP; the first one earns All Green, 25 earn Test Pilot |
| Streak | consecutive calendar days on which anything earned XP |
| Unchecking | refunds the same XP, silently; XP floors at 0; badges are never revoked; ticking it again earns the XP but doesn't re-announce a rank or a station clear |
| Celebration order | the XP toast, then a rank-up, then the streak badges it earned, then the station |
| Deck weighting | weakest cards first: `(right+1)/(seen+2) + random()*0.55`, ascending |
| Mix deck | up to 3 Redemption cards + `ceil(remaining/2)` from the focus phase + the rest |
| Focus phase | Day 1 graphs · Days 2–3 backtracking · Days 4–6 DP · Days 8 & 12 heaps/stacks (ds) · all other days none |

## Verification

There is no unit-test suite for the app — this is a personal app and the tests were
removed on purpose. Two checks remain, and both compare against something real rather
than asserting against assumptions: `npm run problems` runs every problem's reference
solution through the real judge in the real interpreter (above), and the parity harness
below drives the app against `reference/onsite-express.html` in a real browser.

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

### Regression checks: the workspace, the Me tab with sync, and the study tabs

`scripts/regress/` holds three suites of scripted browser sessions, desktop and phone, light
and dark, run by one runner. Each builds the app, serves it with `wrangler dev` (against a
fresh local D1), and writes its run to `$REGRESS_OUT/runs/<label>/` (default
`/tmp/yalc-regress`): assertions in `results.json`, screenshots as PNGs. Comparing two runs
flags any assertion whose outcome changed and any screenshot pixel that moved. They were
written for refactors: run one before a change and after, and the two runs should be
identical.

- **Workspace** (`ws-regress.mjs`): 18 sessions, 392 assertions, 44 screenshots. Runs,
  submits, Stop and time limits, test cases, drafts, the layout, and the assistant against
  a fake Anthropic server.
- **Me tab and sync** (`me-regress.mjs`): 15 sessions, 441 assertions, 55 screenshots. The
  stats, ladder and badges (the `#meArea` markup is hashed), Export, Import and Reset,
  turning sync on and the status card through its phases, joining by code, the link sheet in
  both modes, the consent card, the scanner against a fake camera showing a real QR,
  last-write-wins between two devices, a cloud copy from a newer schema, offline and retry
  paths, and what the Worker's D1 holds after each step. Two devices are two browser
  contexts against the same `wrangler dev`. To make two runs comparable the page is served
  from a fixed origin (`https://yalc.test`, forwarded to the real server), `crypto.randomUUID`
  and the clock are controlled, toasts and phone scrollbars are left out of the pictures, and
  each picture comes with a digest of the page's computed styles, which sees the changes too
  small for the pixel diff; `me-lib.mjs` explains each.
- **Study tabs and shell** (`tabs-regress.mjs` and the `tabs-*.mjs` scenario files): 16
  sessions, 745 assertions, 105 screenshots. The header and tab bar, the Line on both lines
  (rail, day cards, ticking and unticking, milestones, the line picker, the mock clock), the
  Metro board and quiz runs to every ending, the Dojo, celebration timing and ids, the 44 px
  touch targets, hover and pressed states, phone layouts. `Math.random` is seeded so decks,
  shuffles and confetti repeat; the right answers are read from `src/data`, never the page.

```bash
npm install --no-save playwright                           # Chromium too, if you don't have one:
npx playwright install chromium                            # or point CHROMIUM_PATH at yours
scripts/regress/ws-check.sh . 8810 ws-before               # workspace: ports 8810-8812; WS_JOBS=3 runs 3 at once
scripts/regress/me-check.sh . 8910 me-before               # Me tab and sync: ports 8910 and 8912, ~1 minute (~30 s with WS_JOBS=3)
scripts/regress/tabs-check.sh . 8970 tabs-before           # study tabs: ports 8970 and 8972, ~2 minutes (~50 s with WS_JOBS=3)
# ...change the code...
scripts/regress/ws-check.sh . 8810 ws-after
scripts/regress/me-check.sh . 8910 me-after
scripts/regress/tabs-check.sh . 8970 tabs-after
python3 -I scripts/regress/ws-diff.py ws-before ws-after   # needs Pillow; exit 0 = identical
python3 -I scripts/regress/ws-diff.py me-before me-after
python3 -I scripts/regress/ws-diff.py tabs-before tabs-after
```

`me-check.sh` and `tabs-check.sh` are `REGRESS_SUITE=me` / `=tabs ws-check.sh`; `WS_ONLY=03,06` runs only the scenarios whose
id starts with those numbers.

Compare runs made on the same machine: Chromium's text antialiasing can differ between
environments (see below), though two runs in one environment have matched pixel for
pixel.

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
  artifact host on Cloudflare. Corrupt JSON in `localStorage` no longer downgrades
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
  (`src/components/shared/Icon/`), and controls gained hover/press states, tabular
  numerals and small state refinements. Content, layout structure, tokens and behaviour
  are unchanged, but `computed.mjs` and `screenshots.mjs` now report real differences on
  the restyled surfaces — the reference is still ground truth for *content*, no longer
  for every pixel.

Anything else worth doing is written down in `FOLLOW-UPS.md` rather than built.
