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

## Sync

Cloud sync (D1 + the `/api/state` function) shipped after the port, deliberately as a
dumb mirror. What was deliberately *not* built, and the edges that are real:

**Conflicts are last-write-wins on the whole blob.** Two devices that both edit while
apart don't merge — the later `updatedAt` wins and the earlier session's progress is
gone. A field-wise merge (union of `done`, max of counters) sounds easy but XP is a sum
of events, not a derivable value, so an honest merge needs an event log the schema
doesn't have. If sync ever grows a merge, it starts there, not with object spreads.

**Stamps are wall clocks.** `editedAt` is monotonic per device (`max(now, prev+1)`), but
*across* devices LWW trusts the clocks. A device a few minutes slow can lose a race it
actually won. Fine for one person; the fix (a Lamport counter carried in the row) is
cheap if it ever bites.

**The sync code is a bearer token.** Anyone holding it can read and write that one row.
No rate limit, no hashing of the code server-side. For a personal study plan that's
proportionate; rotating means turning sync off and on (new code) — the old row lingers
in D1, and only `curl -X DELETE /api/state/<code>` cleans it up (the endpoint exists,
the UI doesn't).

**Adoption kills an active quiz run.** `SYNC_ADOPT` nulls `session`, because a run
scoring into a replaced world would double-count. Boot pulls and the wake-pull are gated
to never fire mid-run, so this only triggers when a *push* loses a race mid-run — rare,
but it will read as "sync ate my run" the day it happens.

**Two tabs in one browser still race.** Both tabs write the same localStorage key and
now both push; last writer wins, same as before sync existed. A `storage` event listener
would reconcile them and is probably the cheapest item in this section.

**`normalize` is the only gate on adopted data.** The client vets a cloud blob exactly
like an Import (`v === 1`, then field-by-field). A blob some future schema wrote parks
sync (`held`) rather than letting either side overwrite the other — but "parked" surfaces
as the generic error line, which will confuse whoever hits it mid-migration.

Linking by QR landed on top of that same dumb mirror. It inherits every edge above, and
adds these:

**The Get-mode watch discounts its own writes only as far as the acknowledgment.**
`probe()` sees one number, the row's `updatedAt`, and the panel refuses to adopt any
stamp the server has already credited to this device (`SyncStatus.serverAt`) — so a
debounced push landing mid-watch no longer reads as the other device arriving. The
residue is one round trip: a push that has moved the row but whose credit isn't home
yet — an Import saved seconds before the panel opened, a retry that finally gets out —
can still be adopted back as if it came from elsewhere, with everything an adoption
means: a real "Progress synced from the cloud" toast over this device's own data,
`session` nulled, and anything edited inside that window rolled back to the row's copy.
Spooky rather than harmful, and the window is network latency now instead of the 4s
debounce; taking the baseline only after a `flush()` would shave it further.

**The hand-off itself is still last-write-wins, so a "sent" copy can lose.** `claim()`
pushes under the other device's code and the consent card toasts "Progress sent — devices
linked" the moment the server applies it, but the receiving device has an `editedAt` of
its own: any local edit stamped later than that push wins the next exchange and replaces
what just arrived. Leaving the Me tab unmounts the panel and stops the watch, so the
realistic version is the reader wandering off to study while the other device is still
scanning, then coming back to find the two devices linked around the wrong copy. The
panel only ever says "Waiting for the other device…", which is not the same as "stay
here". The honest fix is the event-log merge the top of this section already wants; the
cheap one is copy that asks the reader to wait.

**A Get-mode code dies with its panel.** On a device where sync is off there is no code
to show, so the panel mints one per opening (`useState(sync.mintCode)`) and never
persists it — close the panel, or switch tabs, and it is gone. Scan that square
afterwards and the sending device claims a code nobody is watching: it seeds the row,
turns its own sync on, and syncs alone under a code the other device has already
forgotten, while its card says "devices linked". Rare and self-healing — a fresh square
re-links — but worth knowing. (With sync already on the code is the persisted one, and
the next `syncNow` picks the row up regardless, so this is a fresh-device-only edge.)

**The in-app scanner reads everywhere now, and `jsqr` is what that cost.** It used to gate
on `BarcodeDetector`, which Safari and Firefox don't ship, so on those the button simply
wasn't rendered and computer-reads-phone fell back to typing the code across. The gate is
a camera and nothing else now: `BarcodeDetector` is still taken first where it exists —
it is the browser's own and often the camera hardware's — and jsQR reads the frames
everywhere else. It costs about 132 kB minified — 48 kB over the wire — which was 40% on
top of everything the app weighed before it, and nothing else in the bundle that isn't
React is remotely that size. The trade was made with that number in hand: the alternative
on Safari was no scanner at all, and on an iOS home-screen install no scanner means no way
in at all (below).

**The jsQR path is not free, and the two decoders are not the same decoder.** Every tick
it pulls a frame off a canvas (~1 ms) and walks all of it (~8 ms on a blank frame, ~11 ms
on a hit, measured in Chromium at 640×480 on the machine this was written on; a phone is
some multiple of that). At 250 ms a tick that is a few percent of a core, and the frame is
downscaled to a 640px long edge precisely so it stays that way — which does cost reach:
below roughly two pixels per module in the downscaled frame it stops decoding, so the
square has to fill about an eighth of the frame's width. The behavioural gaps matter more
than the cost. `BarcodeDetector` returns every code in the frame; jsQR returns at most
one, so with two squares on the table the jsQR path reads whichever it locates first. jsQR
also runs with `inversionAttempts: "dontInvert"`, so a light-on-dark QR is invisible to it
— safe here only because `QrCode` deliberately ignores the theme and always draws
dark-on-light, and worth remembering before anything else is ever pointed at that camera.
One free surprise in the other direction: jsQR reads a *mirrored* square as happily as a
straight one, so a front camera that flips its frames costs nothing.

**Standalone iOS is where this all has to work, and it has two edges of its own.**
`getUserMedia` only reaches a home-screen web app in iOS 14.3; below that the accounts
differ on whether `navigator.mediaDevices` is missing outright (so the launcher never
renders) or present and refusing (launcher, then the "No camera here" line). Both ends are
survivable — the code and the paste row are still under the square — but which one an old
iPhone actually does has not been checked on a device. The other edge is that iOS tends to
ask for camera permission again every session in a home-screen app instead of remembering
the grant the way Safari proper does. Nothing to fix app-side; it just reads as a bug the
third time it happens.

**An iOS home-screen install has its own storage.** A camera-app scan opens Safari, not
the installed copy, so "send from the phone" on a device whose progress lives in the
home-screen app sends whatever Safari holds — usually nothing. The consent card says as
much when it is asked to send from a device with no progress. The way through is the
installed app's own scanner: open that copy, tap **Scan a code**, and read the other
device's square from inside the container that actually holds the progress — which is the
whole reason the scanner had to work on Safari's engine. Typing the code across is the
last resort now rather than the only one. Nothing to fix app-side: standalone web apps get
their own storage bucket there, iOS gives a web app no way to claim its own links either,
so no camera-app scan can ever be made to land in the right copy, and that is the
platform.

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
