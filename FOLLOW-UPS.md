# Follow-ups

Things spotted while porting that were deliberately **not** built, because the brief was
parity and these all change behaviour. Roughly in the order I'd do them.

## Worth doing soon

**Reopen the focus day after Import or Reset.**
`openDays` is seeded once at boot from `focusDay(data)` and never recomputed. Import an
export that puts you on Day 5 and the line still shows Day 1 expanded until you tap. The
reference behaves the same way, which is why it's still here. One line in the `IMPORT` and
`RESET` cases of the reducer.

**Nothing warns before Reset wipes an unexported run.**
`window.confirm` asks, but doesn't mention that the progress is unrecoverable if it was
never exported. Offering "Export first?" in that dialog would cost one branch.

## Polish

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

**The unit suite was removed on request** (personal app, no test burden wanted). It was
green at the point of removal: 68 specs across the engine, the date maths, the session
builder, the ported content and the stylesheet. If any of it comes back, the two worth
having first are not the engine tests — they are the drift guards below.

**Nothing now stops `src/data` drifting from the reference.**
This is the real cost of dropping the suite. `data.test.ts` re-evaluated the reference's
own `<script>` block and asserted the four ported modules still deep-equalled it, so a
hand-edit to `src/data/*.ts` — or a bug in `scripts/extract-data.mjs` — could not pass
unnoticed. `css-parity.test.ts` did the same for the stylesheet, catching any rule the
split dropped. Both were cheap and both are gone. Re-running
`node scripts/extract-data.mjs` and checking `git diff` is empty is the manual substitute
for the first; there is no substitute for the second short of the browser harness.

**The parity harness isn't wired into CI.**
`scripts/parity/*` needs Chromium and an `--no-save` Playwright install, so it's a manual
gate. `computed.mjs` is deterministic and would make a good pre-deploy check if the
reference file is going to keep living in the repo. It is now the only automated check of
any kind, which raises the value of wiring it up.

**No component tests.**
`lib/engine.ts` has no coverage at all now, and the browser harness covers only the
rendered result — there is nothing in between, and nothing below. A jsdom render of, say,
`QuizCard` asserting that a revealed card locks its options would be the first thing to
add if the app starts changing again.

## TypeScript

**`normalize` casts at the trust boundary.**
It takes `unknown` and hands back a `PersistedData`, which means somewhere inside it has
to assert. The field-by-field vetting is real — every number goes through a finite check,
every map is copied, every missed id is checked against the bank — but unknown *extra*
keys on a v1 payload ride through untyped, exactly as the reference's `Object.assign` let
them. A schema validator (zod, valibot) would replace the casts with a parse, at the cost
of a runtime dependency the app currently doesn't have. Worth it only if the export format
ever grows.

**`shuffle` uses two non-null assertions.**
Fisher-Yates indexes `a[i]` and `a[j]`, both in bounds by construction, but
`noUncheckedIndexedAccess` can't see that. The alternatives are worse: widening the array
type, or a formulation that changes the swap order and would break determinism against the
reference's own shuffle. Two `!` with a comment is the honest minimum.
