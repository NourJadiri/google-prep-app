# Most tests carry their expected outputs. The two big generated ones carry
# null and are checked against this simulation instead, so the spec doesn't
# have to store a hundred thousand answers.
from collections import deque


def simulate(ops, args):
    q, out = deque(), []
    for op, a in zip(ops, args):
        if op == "push":
            q.append(a[0])
            out.append(None)
        elif op == "pop":
            out.append(q.popleft())
        elif op == "peek":
            out.append(q[0])
        elif op == "empty":
            out.append(not q)
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
