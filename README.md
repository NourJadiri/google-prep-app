# YALC

**Y**et **A**nother **L**eetCode **C**lone: interview prep laid out as a metro line, with a
Python editor in every problem.

- **Onsite Express** (Google): a 24-day study plan, five problems a day, ending in timed mocks.
- **Day One Local** (Amazon): thirteen stops through Seattle, one idea per stop, LeetCode Easy only.

Every problem opens in a workspace with its own statement, a CodeMirror editor and tests
that run in the browser on real CPython (Pyodide). No LeetCode account needed.

## Features

- **Line**: the study plan. Tick problems, open them in the workspace, log the daily
  ritual, run the mock-interview clocks. Switching lines retints the app.
- **Metro**: a thumb-only quiz for the commute. 120 cards, ten stops a run, streaks
  multiply the XP, and missed cards come back in the Redemption deck.
- **Dojo**: 15 algorithm templates, blurred until you've written them from memory.
- **Me**: stats, the rank ladder, badges, export/import and cloud sync.
- **Workspace**: Run the examples, Submit the full hidden suite; passing it ticks the
  problem. Drafts are saved per problem.
- **Bana** (optional): `⌘K` / `Ctrl+K` in the workspace opens a small chat with
  Claude that already knows the problem, your code and your last run. Three modes, picked
  in its header: Normal, Tough love (roasts your code, then shows you exactly where it's
  wrong) and Goth catgirl (who texts you, avatar and all), each with its own look.

Progress is stored in `localStorage`. Cloud sync and the assistant are optional; without
them the app is fully local. It loads nothing from other origins: no web fonts, no
analytics.

## Tech

React 19, TypeScript (strict), Vite, CodeMirror 6, Pyodide in a web worker. Deployed as a
Cloudflare Worker that serves the static build and two small APIs: `/api/state` (sync,
backed by D1) and `/api/assistant` (Anthropic API).

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173 (no Worker: sync and the assistant are off)
```

To run with the Worker, its local D1 and the assistant:

```bash
npm run build
npx wrangler dev   # http://localhost:8787
```

For the assistant locally, create a `.dev.vars` file at the repo root (it is git-ignored):

```
ANTHROPIC_API_KEY=sk-ant-...
ASSISTANT_PASSWORD=some-long-random-string
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run build` | typecheck, then build to `dist/` |
| `npm run preview` | serve the build |
| `npm run typecheck` | `tsc` only |
| `npm run problems` | validate the problem bank's reference solutions in Pyodide |

## Deploying

The whole Worker config is in `wrangler.jsonc`.

1. **D1 database** (for sync): `npx wrangler d1 create yalc`, then put its id in
   `database_id` under `d1_databases` in `wrangler.jsonc`. The table creates itself on
   first use. Without a database, remove the `d1_databases` block: sync then reports the
   cloud as unreachable and everything else works.
2. **Assistant secrets** (optional): in the Cloudflare dashboard, Worker → Settings →
   Variables and Secrets, add `ANTHROPIC_API_KEY` and `ASSISTANT_PASSWORD` as **Secrets**
   (or `npx wrangler secret put <NAME>`). Use an API key from a Console workspace with a
   low monthly spend limit. `ANTHROPIC_BASE_URL` optionally points the Worker at another
   endpoint.
3. **Deploy**: `npm run build && npx wrangler deploy`, or connect the repo in the dashboard
   (Workers & Pages → Create → Import a repository) with build command `npm run build` and
   deploy command `npx wrangler deploy`. The Worker's name must match `name` in
   `wrangler.jsonc`.

`public/_headers` turns on cross-origin isolation, which lets Stop and time limits
interrupt Python without reloading the interpreter, and caches `/pyodide/*` for good.

## Using sync

On one device: **Me → Sync → Turn on sync**. On another: **I have a code → Connect** with
that code, or **Link a device** to pair with a QR code. The code is the only credential,
so treat it like a password. Edits are pushed in the background; when two devices
disagree, the later save wins.

## Project layout

```
src/
  App.tsx, app/      the page shell and tab views
  components/        one folder per area: line/, metro/, dojo/, me/, workspace/,
                     assistant/, layout/, shared/, and ui/ for shared primitives
  lib/engine/        the rules (XP, ranks, badges, streaks, quiz runs) as pure functions
  lib/sync/          the cloud sync client
  state/             the app store: reducer, actions, effect hooks
  types/             the shared types
  data/              the plans, quiz cards, templates, ranks and badges
  data/problems/     the problem bank: statements, tests, reference solutions
  runner/            the Python runner (Pyodide worker and test harness)
worker/              the Cloudflare Worker: sync and assistant endpoints
scripts/             data extraction, problem validation, regression checks
```

## Checks

`npm run build` typechecks the app. For refactors there are browser regression suites
(Playwright) and a differential test for the engine:

```bash
npm install --no-save playwright@1.56.1
scripts/regress/ws-check.sh   . 8810 ws-before     # workspace
scripts/regress/me-check.sh   . 8910 me-before     # Me tab and sync
scripts/regress/tabs-check.sh . 8970 tabs-before   # Line, Metro, Dojo, shell
# ...change the code, run again with an -after label, then:
python3 -I scripts/regress/ws-diff.py ws-before ws-after

node scripts/regress/engine-diff.mjs <git-ref>     # engine vs an earlier commit
```

Each run records scripted sessions and screenshots under `/tmp/yalc-regress/runs/`;
`ws-diff.py` reports any changed assertion or pixel.

`REFACTOR.md` records the code cleanup and `FOLLOW-UPS.md` lists known issues and ideas.
