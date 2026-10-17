#!/usr/bin/env bash
# me-check.sh <repo-dir> <port> <label>
#
# ws-check.sh with the Me suite (me-regress.mjs): the Me tab and cross-device sync.
# Same arguments, same environment (WS_JOBS, WS_ONLY, REGRESS_OUT), same output
# layout; compare two runs with `python3 -I ws-diff.py <labelA> <labelB>`.
exec env REGRESS_SUITE=me "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/ws-check.sh" "$@"
