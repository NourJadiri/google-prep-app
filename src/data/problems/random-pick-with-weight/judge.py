# pickIndex is random, so this judge drives the object itself. In place of
# each pick it records "ok" when the index is in range, or a sentence saying
# what went wrong. After the last pick it compares how often each index came up
# with its share of the weight: every count has to land within six standard
# deviations (plus a little slack for rarely-picked indices) of
# picks * w[i] / sum(w). A correct solution fails that about once in a hundred
# million runs; one that ignores the weights, or is off by one on small
# weights, fails it every time. If it fails, the last pick's entry carries the
# verdict. Big tests carry expected = null; their expected output is simple.
import math

SIGMAS = 6
SLACK = 10


def _unfair(w, counts, picks, first, last):
    total = sum(w)
    bad = []
    for i, (wi, c) in enumerate(zip(w, counts)):
        p = wi / total
        e = picks * p
        if abs(c - e) > SIGMAS * math.sqrt(picks * p * (1 - p)) + SLACK:
            bad.append((abs(c - e) / max(e, 1), i))
    if not bad:
        return None
    if len(w) <= 8:
        got = "[" + ", ".join(format(c, ",") for c in counts) + "]"
        want = "[" + ", ".join(format(round(picks * wi / total), ",") for wi in w) + "]"
        detail = "per-index counts were " + got + " where about " + want + " was expected"
    else:
        _, i = max(bad)
        detail = ("index " + str(i) + " (weight " + str(w[i]) + " of " + format(total, ",")
                  + ") came up " + format(counts[i], ",") + " times where about "
                  + format(round(picks * w[i] / total), ",") + " was expected")
        if len(bad) > 1:
            detail += ", and " + str(len(bad) - 1) + " other index" + ("es are" if len(bad) > 2 else " is") + " off too"
    return ("The picks don't follow the weights: over calls #" + str(first) + " to #" + str(last)
            + " (" + format(picks, ",") + " picks), " + detail + ".")


def run_design(cls, ops, args):
    w = list(args[0][0])          # our own copy: the constructor may rewrite its list in place
    obj = cls(*args[0])
    n = len(w)
    out = [None]
    counts = [0] * n
    picks, first, last = 0, 0, 0
    for k in range(1, len(ops)):
        if ops[k] != "pickIndex":
            out.append(plain(getattr(obj, ops[k])(*args[k])))
            continue
        i = plain(obj.pickIndex())
        if isinstance(i, int) and not isinstance(i, bool) and 0 <= i < n:
            counts[i] += 1
            out.append("ok")
        else:
            out.append("Call #" + str(k) + " pickIndex() returned " + show(i, 80)
                       + ", which isn't an index of w (0 to " + str(n - 1) + ").")
        if picks == 0:
            first = k
        picks += 1
        last = k
    if picks and out[last] == "ok":
        verdict = _unfair(w, counts, picks, first, last)
        if verdict:
            out[last] = verdict
    return out


def check(got, expected, args):
    ops, xs = args["ops"], args["args"]
    if expected is None:
        expected = [None] + ["ok" if op == "pickIndex" else None for op in ops[1:]]
    if not isinstance(got, list) or len(got) != len(expected):
        return False
    for k, (g, e) in enumerate(zip(got, expected)):
        if not same(g, e):
            if ops[k] == "pickIndex" and isinstance(g, str):
                return g
            call = ops[k] + "(" + ", ".join(show(v, 80) for v in xs[k]) + ")"
            return "Call #" + str(k) + " " + call + " returned " + show(g, 200) + ", expected " + show(e, 200) + "."
    return True
