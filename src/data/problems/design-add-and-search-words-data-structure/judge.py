# Most tests carry their expected outputs; the 10,000-call test carries null
# and is checked against this simulation instead. Every added word registers
# each pattern that could match it (the word with any one or two letters
# turned into dots), so each query becomes a single set lookup.
from itertools import combinations


def simulate(ops, args):
    patterns, out = set(), []
    for op, a in zip(ops, args):
        if op == "addWord":
            w = a[0]
            patterns.add(w)
            for k in (1, 2):
                for spots in combinations(range(len(w)), k):
                    p = list(w)
                    for i in spots:
                        p[i] = "."
                    patterns.add("".join(p))
            out.append(None)
        elif op == "search":
            out.append(a[0] in patterns)
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
            call = ops[k] + "(" + ", ".join(show(v, 80) for v in xs[k]) + ")"
            return "Call #" + str(k) + " " + call + " returned " + show(g, 200) + ", expected " + show(e, 200) + "."
    return True
