# getRandom can't be compared with a fixed answer, so this judge drives the
# object itself. It keeps its own copy of the set, and in place of each
# getRandom value it records "ok" when the value is a member at that moment,
# or a sentence saying what went wrong. A long run of getRandom calls on an
# unchanging set is also judged for fairness: every member's count has to land
# within six standard deviations of an even share. A fair implementation fails
# that about once in a hundred million runs; one that favours some member by a
# few percent fails it every time. Big tests carry expected = null and get
# their expected outputs from simulate().
import math

SIGMAS = 6
MIN_SHARE = 200   # a run is judged only when each member is expected this often


def _describe(members):
    if len(members) <= 8:
        return "[" + ", ".join(str(v) for v in sorted(members)) + "]"
    return "a set of " + format(len(members), ",") + " members"


def _is_member(v, members):
    return isinstance(v, int) and not isinstance(v, bool) and v in members


def _unfair(counts, members, calls, first, last):
    n = len(members)
    if n < 2 or calls < MIN_SHARE * n:
        return None
    share = calls / n
    sd = math.sqrt(calls * (1 / n) * (1 - 1 / n))
    off = [v for v in sorted(members) if abs(counts.get(v, 0) - share) > SIGMAS * sd + 1]
    if not off:
        return None
    shown = sorted(members) if n <= 8 else off[:5]
    tally = ", ".join(str(v) + ": " + format(counts.get(v, 0), ",") for v in shown)
    if n > 8 and len(off) > 5:
        tally += ", …"
    return ("getRandom isn't uniform: over calls #" + str(first) + " to #" + str(last) + " ("
            + format(calls, ",") + " in a row on " + _describe(members) + "), each member should"
            + " come up about " + format(round(share), ",") + " times, but the counts were "
            + tally + ".")


def run_design(cls, ops, args):
    obj = cls(*args[0])
    members = set()
    out = [None]
    counts, calls, first = {}, 0, 0
    for k in range(1, len(ops)):
        op, xs = ops[k], args[k]
        if op == "getRandom":
            v = plain(obj.getRandom())
            if _is_member(v, members):
                out.append("ok")
                counts[v] = counts.get(v, 0) + 1
            else:
                out.append("Call #" + str(k) + " getRandom() returned " + show(v, 80)
                           + ", which isn't in the set at that point: it holds "
                           + _describe(members) + ".")
            if calls == 0:
                first = k
            calls += 1
            continue
        if calls:
            verdict = _unfair(counts, members, calls, first, k - 1)
            if verdict and out[k - 1] == "ok":
                out[k - 1] = verdict
            counts, calls = {}, 0
        out.append(plain(getattr(obj, op)(*xs)))
        if op == "insert":
            members.add(xs[0])
        elif op == "remove":
            members.discard(xs[0])
    if calls:
        verdict = _unfair(counts, members, calls, first, len(ops) - 1)
        if verdict and out[-1] == "ok":
            out[-1] = verdict
    return out


def simulate(ops, args):
    s, out = set(), []
    for op, xs in zip(ops, args):
        if op == "insert":
            out.append(xs[0] not in s)
            s.add(xs[0])
        elif op == "remove":
            out.append(xs[0] in s)
            s.discard(xs[0])
        elif op == "getRandom":
            out.append("ok")
        else:
            out.append(None)
    return out


def check(got, expected, args):
    ops, xs = args["ops"], args["args"]
    if expected is None:
        expected = simulate(ops, xs)
    if not isinstance(got, list) or len(got) != len(expected):
        return False
    for k, (g, e) in enumerate(zip(got, expected)):
        if not same(g, e):
            if ops[k] == "getRandom" and isinstance(g, str):
                return g
            call = ops[k] + "(" + ", ".join(show(v, 80) for v in xs[k]) + ")"
            return "Call #" + str(k) + " " + call + " returned " + show(g, 200) + ", expected " + show(e, 200) + "."
    return True
