# Most tests carry their expected outputs; the big one carries null and is
# checked against this straightforward simulation instead, so the spec doesn't
# have to store twenty thousand answers.
from collections import deque


def simulate(ops, args):
    q, out = deque(), []
    for op, a in zip(ops, args):
        if op == "record":
            q.append(a[0])
            out.append(None)
        elif op == "count":
            t = a[0]
            while q and q[0] <= t - 300:
                q.popleft()
            out.append(len(q))
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
            return ("Call #" + str(k) + " " + ops[k] + "(" + ", ".join(map(str, xs[k])) + ")"
                    + " returned " + show(g) + ", expected " + show(e) + ".")
    return True
