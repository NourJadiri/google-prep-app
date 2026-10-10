# Most tests carry their expected outputs; the 30,000-call test carries null
# and is checked against this plain simulation instead (a set of the words and
# a set of every prefix of every word), so the spec doesn't have to store
# thirty thousand answers.


def simulate(ops, args):
    words, prefixes, out = set(), set(), []
    for op, a in zip(ops, args):
        if op == "insert":
            w = a[0]
            words.add(w)
            for k in range(1, len(w) + 1):
                prefixes.add(w[:k])
            out.append(None)
        elif op == "search":
            out.append(a[0] in words)
        elif op == "startsWith":
            out.append(a[0] in prefixes)
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
