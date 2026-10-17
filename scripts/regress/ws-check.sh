#!/usr/bin/env bash
# ws-check.sh <repo-dir> <port> <label>
#
# Regression harness for the workspace. Builds <repo-dir>, serves it
# with `wrangler dev` on <port> (mock Anthropic on <port+1>, inspector on
# <port+2>), runs the Playwright suite (ws-regress.mjs) and leaves
#   <out>/runs/<label>/{results.json,*.png,summary.txt,*.log}
# behind, where <out> is $REGRESS_OUT (default /tmp/yalc-regress). Safe to run
# concurrently for different ports / checkouts: it only ever signals the process
# groups it started itself. Exit status is non-zero when the
# build, the servers or any scenario fails.
#
# One run per checkout at a time (a lock in <out>/locks); any number of runs on
# different checkouts / ports. A pre-existing <repo>/.dev.vars and .wrangler/ are kept.
#
# Optional environment:
#   WS_JOBS=3    run the scenarios three at a time (about 1 minute instead of 2)
#   WS_ONLY=03,06  run only the scenarios whose id starts with one of these
#
# Compare two runs afterwards with:  python3 -I ws-diff.py <labelA> <labelB>

set -uo pipefail
set +m   # job control OFF: `setsid cmd &` then makes $! the pid *and* pgid of cmd

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRATCH="${REGRESS_OUT:-${TMPDIR:-/tmp}/yalc-regress}"
mkdir -p "$SCRATCH"

if [ "$#" -ne 3 ]; then
  echo "usage: $0 <repo-dir> <port> <label>" >&2
  exit 2
fi
REPO="$(cd "$1" 2>/dev/null && pwd)" || { echo "ws-check: no such directory: $1" >&2; exit 2; }
PORT="$2"
LABEL="$3"
case "$PORT" in ''|*[!0-9]*) echo "ws-check: port must be a number" >&2; exit 2 ;; esac
case "$LABEL" in ''|*[!A-Za-z0-9._-]*) echo "ws-check: label must match [A-Za-z0-9._-]+" >&2; exit 2 ;; esac
MOCK_PORT=$((PORT + 1))
INSPECT_PORT=$((PORT + 2))

OUT="$SCRATCH/runs/$LABEL"
STATE="$SCRATCH/wrangler-state-$PORT"
MOCK_LOG="$OUT/mock-requests.jsonl"
BASE="http://127.0.0.1:$PORT"

port_open() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }

for p in "$PORT" "$MOCK_PORT" "$INSPECT_PORT"; do
  if port_open "$p"; then
    echo "ws-check: port $p is already in use (a run needs $PORT, $MOCK_PORT and $INSPECT_PORT)" >&2
    exit 2
  fi
done

# One run per checkout at a time (they share <repo>/.dev.vars, dist/ and .wrangler/);
# runs on other checkouts, or other ports, are independent. mkdir is the atomic lock.
LOCK_DIR="$SCRATCH/locks/$(printf '%s' "$REPO" | cksum | cut -d' ' -f1).lock"
mkdir -p "$SCRATCH/locks"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  holder="$(cat "$LOCK_DIR/pid" 2>/dev/null || true)"
  if [ -n "$holder" ] && kill -0 "$holder" 2>/dev/null; then
    echo "ws-check: another run (pid $holder, $(cat "$LOCK_DIR/label" 2>/dev/null)) is using $REPO; one run per checkout at a time" >&2
    exit 2
  fi
  rm -rf "$LOCK_DIR"            # stale lock from a run that was killed outright
  mkdir "$LOCK_DIR" || { echo "ws-check: cannot take the lock $LOCK_DIR" >&2; exit 2; }
fi
echo "$$" >"$LOCK_DIR/pid"
echo "$LABEL on :$PORT" >"$LOCK_DIR/label"

T0=$SECONDS
MOCK_PID=""
WRANGLER_PID=""
SUITE_PID=""
DEV_VARS_BACKUP=""
DEV_VARS_EXISTED=0
WRANGLER_DIR_EXISTED=0
CLEANED=0

# Stop one process group we started: TERM, a short grace period, then KILL.
stop_group() {
  local pid="$1"
  [ -n "$pid" ] || return 0
  kill -TERM -- "-$pid" 2>/dev/null || true
  local i
  for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
    pgrep -g "$pid" >/dev/null 2>&1 || return 0
    sleep 0.25
  done
  kill -KILL -- "-$pid" 2>/dev/null || true
}

cleanup() {
  [ "$CLEANED" = 1 ] && return 0
  CLEANED=1
  trap - EXIT INT TERM HUP
  stop_group "$SUITE_PID"
  stop_group "$WRANGLER_PID"
  stop_group "$MOCK_PID"
  # Only touch the repo's gitignored files we made.
  if [ "$DEV_VARS_EXISTED" = 1 ] && [ -n "$DEV_VARS_BACKUP" ] && [ -f "$DEV_VARS_BACKUP" ]; then
    cat "$DEV_VARS_BACKUP" >"$REPO/.dev.vars"
  else
    rm -f "$REPO/.dev.vars"
  fi
  [ -n "$DEV_VARS_BACKUP" ] && rm -f "$DEV_VARS_BACKUP"
  if [ "$WRANGLER_DIR_EXISTED" = 0 ]; then
    rm -rf "$REPO/.wrangler"
  else
    rm -rf "$REPO/.wrangler/tmp"
  fi
  rm -rf "$STATE"
  rm -rf "$LOCK_DIR"
}
trap cleanup EXIT
trap 'echo "ws-check: interrupted" >&2; exit 130' INT TERM HUP

mkdir -p "$SCRATCH/runs"
rm -rf "$OUT" "$STATE"
mkdir -p "$OUT"

cd "$REPO" || exit 2

# ---------------------------------------------------------------- build
if [ ! -d node_modules ]; then
  echo "ws-check[$LABEL]: node_modules missing, npm ci ..."
  if ! npm ci >"$OUT/npm-ci.log" 2>&1; then
    echo "ws-check[$LABEL]: npm ci FAILED" >&2
    cat "$OUT/npm-ci.log" >&2
    exit 1
  fi
fi

echo "ws-check[$LABEL]: npm run build in $REPO ..."
if ! npm run build >"$OUT/build.log" 2>&1; then
  echo "ws-check[$LABEL]: BUILD FAILED" >&2
  cat "$OUT/build.log" >&2
  exit 1
fi
echo "ws-check[$LABEL]: build ok ($((SECONDS - T0))s)"

# ---------------------------------------------------------------- servers
if [ -e .dev.vars ]; then
  DEV_VARS_EXISTED=1
  DEV_VARS_BACKUP="$SCRATCH/.dev.vars.backup-$PORT"
  cat .dev.vars >"$DEV_VARS_BACKUP"
fi
[ -e .wrangler ] && WRANGLER_DIR_EXISTED=1
cat >.dev.vars <<EOF
ANTHROPIC_API_KEY=sk-ant-test
ASSISTANT_PASSWORD=pw-test
ANTHROPIC_BASE_URL=http://127.0.0.1:$MOCK_PORT
EOF

: >"$MOCK_LOG"
setsid node "$HERE/mock-anthropic.mjs" "$MOCK_PORT" "$MOCK_LOG" >"$OUT/mock.out" 2>&1 &
MOCK_PID=$!

WRANGLER_STATE_DIR="$STATE"
WRANGLER_SEND_METRICS=false setsid npx wrangler dev --port "$PORT" --inspector-port "$INSPECT_PORT" \
  --persist-to "$WRANGLER_STATE_DIR" >"$OUT/wrangler.log" 2>&1 &
WRANGLER_PID=$!

echo "ws-check[$LABEL]: waiting for the mock (:$MOCK_PORT) and wrangler dev (:$PORT) ..."
ready=0
for i in $(seq 1 240); do
  if ! kill -0 "$WRANGLER_PID" 2>/dev/null; then
    echo "ws-check[$LABEL]: wrangler dev exited early:" >&2
    cat "$OUT/wrangler.log" >&2
    exit 1
  fi
  if ! kill -0 "$MOCK_PID" 2>/dev/null; then
    echo "ws-check[$LABEL]: the mock exited early:" >&2
    cat "$OUT/mock.out" >&2
    exit 1
  fi
  if port_open "$MOCK_PORT" && [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "$BASE/" 2>/dev/null)" = "200" ]; then
    ready=1
    break
  fi
  sleep 0.5
done
if [ "$ready" != 1 ]; then
  echo "ws-check[$LABEL]: servers not ready after 120s:" >&2
  cat "$OUT/wrangler.log" >&2
  exit 1
fi
echo "ws-check[$LABEL]: servers up ($((SECONDS - T0))s), running the suite against $BASE"

# ---------------------------------------------------------------- suite
SUITE_T0=$SECONDS
# In the background + `wait`, so that Ctrl-C / SIGTERM interrupt this script at once and the trap
# can take the suite down with the servers. (ws-regress.mjs writes $OUT/summary.txt itself.)
WS_MOCK_LOG="$MOCK_LOG" setsid node "$HERE/ws-regress.mjs" "$BASE" "$OUT" &
SUITE_PID=$!
wait "$SUITE_PID"
status=$?
SUITE_PID=""
echo "ws-check[$LABEL]: suite $((SECONDS - SUITE_T0))s, total $((SECONDS - T0))s, exit $status"
echo "ws-check[$LABEL]: results in $OUT"

exit "$status"
