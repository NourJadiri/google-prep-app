# Most tests carry their expected outputs; the big ones carry null and are
# checked against this plain simulation instead, so the spec doesn't have to
# store a hundred thousand answers.


def simulate(ops, args):
    history, out = {}, []
    for op, a in zip(ops, args):
        if op == "set":
            key, value, t = a
            history.setdefault(key, ([], []))
            history[key][0].append(t)
            history[key][1].append(value)
            out.append(None)
        elif op == "get":
            key, t = a
            times, values = history.get(key, ([], []))
            lo, hi = 0, len(times)          # find the count of times <= t
            while lo < hi:
                mid = (lo + hi) // 2
                if times[mid] <= t:
                    lo = mid + 1
                else:
                    hi = mid
            out.append(values[lo - 1] if lo else "")
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
