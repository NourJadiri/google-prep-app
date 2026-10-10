# Most tests carry their expected outputs. The two big ones carry null and are
# checked against this simulation instead, so the spec doesn't have to store
# ten thousand answers apiece.
import heapq


def simulate(ops, args):
    out, top = [], []
    k = 0
    for op, a in zip(ops, args):
        if op == "add":
            heapq.heappush(top, a[0])
            if len(top) > k:
                heapq.heappop(top)
            out.append(top[0])
        else:  # the constructor
            k = a[0]
            top = heapq.nlargest(k, a[1])
            heapq.heapify(top)
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
