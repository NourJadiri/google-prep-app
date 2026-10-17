#!/usr/bin/env bash
# tabs-check.sh <repo-dir> <port> <label>
#
# ws-check.sh with the Tabs suite (tabs-regress.mjs): the Line, Metro and Dojo tabs, the app shell (header, tab
# bar) and the celebrations (toasts, confetti). Same arguments, same environment (WS_JOBS, WS_ONLY, REGRESS_OUT),
# same output layout; compare two runs with `python3 -I ws-diff.py <labelA> <labelB>`.
exec env REGRESS_SUITE=tabs "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/ws-check.sh" "$@"
