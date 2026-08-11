# Follow-ups

Things spotted while porting that were deliberately **not** built, because the brief was
parity and these all change behaviour. Roughly in the order I'd do them.

## Worth doing soon

**Reopen the focus day after Import or Reset.**
`openDays` is seeded once at boot from `focusDay(data)` and never recomputed. Import an
export that puts you on Day 5 and the line still shows Day 1 expanded until you tap. The
reference behaves the same way, which is why it's still here. One line in the `IMPORT` and
`RESET` cases of the reducer.

**The dojo's chevron is dead.**
Template cards render `<span class="chev">▾</span>`, but the only rules for `.chev` are
scoped to `.dayhead .chev` and `.stn.open .chev`. So in the dojo it never rotates when the
card opens, and it inherits `--ink` instead of the `--ink2` its counterpart on the line
uses. Faithful to the reference, but it reads as a bug. Fix by promoting the two rules to
bare `.chev` / `.open .chev`.

**Nothing warns before Reset wipes an unexported run.**
`window.confirm` asks, but doesn't mention that the progress is unrecoverable if it was
never exported. Offering "Export first?" in that dialog would cost one branch.

## Polish

**`apple-touch-icon` for Add to Home Screen.**
The favicon is an inlined SVG data URI, which covers the browser tab. iOS wants a PNG for
the home-screen icon and currently falls back to a screenshot of the page. Needs a real
PNG committed (or a tiny build step), so it was out of scope for a no-new-deps port.

**The blurred template code is only visually hidden.**
`filter: blur(7px)` plus `user-select: none` stops a casual peek, but the text is still in
the accessibility tree and still copyable via keyboard. If the point is "no peeking", the
code should not be in the DOM until revealed. That is a real behaviour change: it would
break the reveal animation and change what a screen reader announces, so it needs a
decision rather than a patch.

**Reveal state is session-scoped.**
Revealed templates reset on reload — deliberate, per the brief, and arguably the right
call for a memory drill. If it ever annoys, `shownTpl` is already in the store and would
just need adding to the persisted schema (which would mean a `v: 2` migration).

**Timer state is not persisted.**
Reload mid-mock and the clock is back at 25:00. Fine for a 25-minute sitting, but a
backgrounded iOS tab that gets reclaimed loses it too.

## Sharper edges

**Streaks use the device's local calendar day.**
`todayStr()` reads local date parts, so flying east across a date line can hand you two
"days" in twenty hours, and flying west can cost you a streak. Given this is built for
someone about to get on a plane, that is worth knowing. A UTC-based day would trade one
oddity for another; the honest fix is storing the timezone offset alongside `last`.

**`done` keeps ids the plan no longer has.**
Derivations already filter through `PROBS`, so a stale id can't inflate any count — but it
stays in the export forever. `normalize()` could drop unknown problem ids the way it
already drops unknown ids from `quiz.missed`.

**A Redemption run can't earn the perfect-run bonus.**
`nextCard` guards on `ids.length >= 10`, so clearing a 6-card Redemption deck perfectly
pays nothing extra. That is the reference's rule and probably intentional — a short deck
is an easier ten — but it surprises the first time it happens.

**No keyboard path through the quiz.**
The brief is explicit that Metro mode is thumbs-only, so this is by design. If it ever
gets used at a desk, A–D key handlers on the option buttons would be a few lines.

## Testing

**The parity harness isn't wired into CI.**
`scripts/parity/*` needs Chromium and an `--no-save` Playwright install, so it's a manual
gate. `computed.mjs` is deterministic and would make a good pre-deploy check if the
reference file is going to keep living in the repo.

**No component tests.**
`lib/engine.js` is covered thoroughly and the browser harness covers the rendered result,
but there is nothing in between — no jsdom render of, say, `QuizCard` asserting that a
revealed card locks its options. The browser harness catches those today; if it ever gets
dropped, that gap opens up.
