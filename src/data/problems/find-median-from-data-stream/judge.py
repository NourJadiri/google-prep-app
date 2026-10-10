# Most tests carry their expected outputs. The two large ones carry null and
# are checked against this sorted-list simulation instead, so the spec doesn't
# have to store tens of thousands of medians.
from bisect import insort


def simulate(ops, args):
    data, out = [], []
    for op, a in zip(ops, args):
        if op == "addNum":
            insort(data, a[0])
            out.append(None)
        elif op == "findMedian":
            m = len(data) // 2
            out.append(float(data[m]) if len(data) % 2 else (data[m - 1] + data[m]) / 2)
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
