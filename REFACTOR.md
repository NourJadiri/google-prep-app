# Refactor roadmap

The app was written fast and reads badly: bloated files, several components per file, logic and
markup tangled together, and long comments that narrate history instead of explaining code. This
file is the plan for cleaning it up one self-contained area at a time, and the record of where
that stands.

## Rules every step follows

- **One component per file**, named after the component. A small part used by one parent still
  gets its own file.
- **Feature folders.** Components sit at the root of the feature's folder, hooks in `hooks/`, pure
  logic and types in `lib/`. Shared UI primitives live in `src/components/ui/`, shared hooks in
  `src/hooks/`, shared helpers in `src/lib/`.
- **High-level components read like an outline**: a composition of named parts. Raw markup belongs
  in leaf components.
- **Logic out of views.** State machines, effects, persistence and keyboard handling go in hooks;
  pure derivations go in plain modules.
- **Comments: none by default.** Keep one line where the reason is not visible in the code (a
  browser quirk, an ordering constraint, a security choice). No file-header essays, no history, no
  section banners, no restating what the code says.
- **No behavior or visual change.** Each step is checked with scripted sessions and screenshots of
  the area, run before and after; the step ships only when both match.

## Steps

| # | Area | State |
|---|------|-------|
| 1 | Workspace: problem pane, editor, console, Python runner, the assistant, plus the first shared UI primitives | done |
| 2 | Me tab and sync: sync panel, link sheet, scanner, `lib/sync.ts` | |
| 3 | Line, Metro and Dojo tabs, the app shell, shared components (`Icon`, celebrations) | |
| 4 | State and domain: `lib/engine.ts`, `state/AppState.tsx`, `types.ts`, data files | |

The domain layer (step 4) is the safest mechanical split, but the components are what reads worst,
so they go first. When step 4 comes, `lib/engine.ts` can stay as a re-exporting barrel so no UI
import has to change.

## Step 1 result

The workspace and the assistant went from 17 files to 119 (65 components). The largest component
file went from 524 lines to 151, and comments from 9% of lines to 4%. `Workspace` is now a shell over
`WorkspaceBody`, which wires hooks (`useDraft`, `useRunSession`, `useWorkspaceShortcuts`…) into
named parts (`header/`, `layout/`, `problem/`, `editor/`, `console/`). The assistant lives in
`src/components/assistant/`, and the Worker's half in `worker/assistant/`. Shared pieces started in
`src/components/ui/`, `src/hooks/` and `src/lib/`.

Checked with 18 scripted scenarios (388 assertions) and 44 screenshots, desktop and phone, light
and dark, including the assistant against a fake Anthropic server: identical before and after,
pixel for pixel.

Left for later, on purpose:
- Class names were kept (`ws-btn`, `asst-*`…) so the screenshots stayed comparable. The `ui/`
  components still render `ws-*` classes; rename them when another area adopts them.
- `Note`, `Pre`, `Hint` (console) and `SectionHeading` (problem) are local primitives that belong
  in `ui/` once a second area needs them.
- The answer renderer's Python highlighting duplicates the editor's highlight style.
- The client and the Worker each declare the assistant's request shape and the 40-turn cap.
- Known quirks kept as they were: the verdict can focus a different case than the chip order
  suggests when a typed case is broken; crossing the 900 px breakpoint remounts the editor and the
  assistant (losing undo history and the chat); "Nothing to run" shows its message twice.

## Audit (October 2026)

### 1. Workspace — `src/components/workspace/`, `src/runner/`
- `Workspace.tsx` (521 lines) defines four components and a hook. `Body` alone is 360 lines and
  mixes draft persistence, run orchestration, keyboard shortcuts, font prefs, reset, copy-for-Claude,
  the assistant's open state, three big JSX blocks held in variables, and the desktop/phone layouts.
- `ConsolePane.tsx` defines five components plus the run-plan types that `Workspace` builds.
- Duplicated: case labelling (`labelFor` / `describe`), `initialCases` / `restore`, platform
  detection (`onMac` / `MOD`), copy-and-flash (2.2 s and 1.8 s versions), three hand-rolled tab
  strips, the spinner.
- `Editor.tsx` mixes the CodeMirror theme, the highlight style and the error-line field with the
  component. `Markdown.tsx` mutates the global `marked` at import time.
- `workspace.css` styles the whole area, including global `.md`, `kbd` and `.split`.
- Target: `Workspace` becomes a shell over named parts (`WorkspaceHeader`, `ProblemMeta`,
  `HeaderActions`, `DesktopLayout`, `MobileLayout`, `EditorPane`, `EditorToolbar`, `CaseEditor`,
  `Results`, `CaseDetail`…) with hooks (`useDraft`, `useRunSession`, `useCaseDrafts`,
  `useWorkspaceShortcuts`, `useWorkspacePrefs`) and pure modules (`runPlan`, `verdict`,
  `claudePrompt`, `markdown`).
- Keep: `Body` keyed by problem id (its unmount flush means "leaving the problem"); the window
  key listener skips `defaultPrevented` events, which the editor and the assistant rely on; Ctrl-K
  alone stays the editor's on a Mac; all three phone panes stay mounted; the runner store returns a
  stable snapshot; drafts and prefs keep their storage keys.

### 2. Assistant — `Assistant.tsx`, `answer.ts`, `assistant.css`, `lib/assistant.ts`, `worker/assistant.ts`
- `Assistant` is a 351-line component: chat transport, password lock and refusal, focus in and out,
  stick-to-bottom scrolling, composer auto-grow, drag, resize and saved placement, keys, and 132
  lines of JSX.
- `Workspace` reaches into its DOM by class (`.asst:not([hidden])`) and owns its ⌘K binding.
- The client/worker contract (turn shape, the 40-turn cap) is declared on both sides by hand.
- `answer.ts`'s highlight rules are a twin of the editor's.
- Target: an `assistant/` folder with `Assistant`, `AssistantHeader`, `LockScreen`, `MessageLog`,
  `Question`, `Answer`, `Composer`… and hooks `useAssistantChat`, `usePassword`, `useFloatingBox`,
  `useStickToBottom`.
- Keep: a refused password keeps the bounced question and re-sends it after unlock; code and run
  snapshots only ride along when they changed; Esc and ⌘Enter inside the window are swallowed so the
  workspace never sees them; the window stays mounted while hidden so the chat survives; answers
  render through their own safe `marked` instance.

### 3. Me tab and sync — `src/components/me/`, `lib/sync.ts`, `lib/link.ts`
- `LinkSheet` (352 lines) is dialog chrome, a polling state machine and three body variants in one.
- `ScanOverlay` has one 150-line effect: camera acquisition, decoder choice, scan loop, teardown.
- `SyncPanel` (327 lines) holds the status card, two 40-line control trees and five action handlers.
- Outcome toasts, clipboard copy and the "not a sync code" message are each written three times.
- `lib/sync.ts` (452 lines) mixes config persistence, the status store, HTTP and timers.
- Keep: push debounce and flush timing, last-write-wins adoption by reference, the `held` state, the
  `#sync=` fragment flow and consent card, the sheet's fixed tree position (it must not remount), the
  scanner's BarcodeDetector/jsQR fallback. `scripts/parity` diffs the `#meArea` markup against the
  reference app, so its stats, ladder, badges and data panel keep their markup.

### 4. Line, Metro, Dojo, shell, shared — `src/components/{line,metro,dojo,layout,shared}/`, `src/styles/`
- Mostly one component per file already; the mess is elsewhere. `Icon.tsx` is 347 lines of path
  data with names declared twice and four unused glyphs.
- CSS ownership is wrong: `line.css` defines `.diff`, `.tag` and `.xpv` that the workspace uses,
  `layout.css` holds buttons used by Metro and Me, and `shared.css` (which styles `CodeBlock`) is
  imported only by `Celebrations`.
- Leaf components pull `useApp` for a single action. `DeckPicker` special-cases deck ids in four places.
- Repeated patterns to turn into primitives: cards, disclosures, buttons (`.mbtn`, `.tbtn`, `.next`…),
  tags and pills, mono eyebrow labels, progress bars, two-line list rows, notes.
- Keep: per-line tinting through `data-track`, the `--seg` station variable and rail trims, the mock
  timer above the views, monotonic celebration ids, the 44 px touch-target overlays in `base.css`,
  the z-index ladder (header 30, tabs 40, workspace 50, confetti 55, overlays 58, toasts 60).

### 5. State and domain — `lib/engine.ts`, `state/`, `types.ts`, `src/data/`
- `engine.ts` (649 lines) mixes the persisted schema and migration, selectors, rank math, the
  award/XP/streak kernel, line rules, quiz decks and sessions, and UI copy.
- `AppState.tsx` puts persisted data, UI state and the celebration queue in one shape, and its
  provider owns four unrelated effects (save, sync, hash links, lifecycle flush).
- `types.ts` is 40% comments and mixes content, persisted state, UI and engine types.
- Dead exports: `PROBS`, `DAY_OF`, `TOTAL`, `STOPS`, `blankTrack`, `dayDone`, `acceptedTotal`,
  `buildSession`, `multiplier`, `pickWeighted`, `persist`, `storageMode`, `XPD`.
- Keep: every storage key (`onsite-express-*`); the v1→v2 `normalize` semantics; the engine
  returning the same `data` object for no-ops (effects compare by reference); the order of
  celebration effects; problem ids, which key real exports.

### Shared UI patterns found across areas
Buttons (`.ws-btn`, `.mbtn`, `.asst-send`, `.tbtn`, `.next`), icon buttons (`.ws-iconbtn`),
link-style buttons (`.ws-linkbtn`, `.sublink`), tabs and segmented switches (`.ws-tabs`, `.ws-seg`,
`.segtoggle`), pills and tags (`.ws-badge`, `.ws-topic`, `.tag`, `.diff`), status dots (`.ws-dot`),
spinners, notices (`.asst-trouble`, `.ws-note`, `.storenote`), cards (`.daycard`, `.synccard`,
`.dboard`…), overlays (`.scanwrap`, `.qrscrim`), text fields (`.syncinput`, `.io`, the assistant's
inputs). Step 1 starts `src/components/ui/` with the ones the workspace uses; later steps extend it
instead of adding new one-offs.
