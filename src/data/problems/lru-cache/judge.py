# Most tests carry their expected outputs. The large one would need 200,000
# of them, so it carries null and is checked against this plain OrderedDict
# model of the cache instead.
from collections import OrderedDict


def simulate(ops, args):
    out, cache, capacity = [], OrderedDict(), 0
    for op, a in zip(ops, args):
        if op == "get":
            key = a[0]
            if key in cache:
                cache.move_to_end(key)
                out.append(cache[key])
            else:
                out.append(-1)
        elif op == "put":
            key, value = a
            if key in cache:
                cache.move_to_end(key)
            cache[key] = value
            if len(cache) > capacity:
                cache.popitem(last=False)
            out.append(None)
        else:                               # the constructor
            capacity = a[0]
            out.append(None)
    return out


def check(got, expected, args):
    ops, xs = args["ops"], args["args"]
    if expected is None:
        expected = simulate(ops, xs)
    if not isinstance(got, list) or len(got) != len(expected):
        return "Expected " + str(len(expected)) + " outputs, one per operation."
    if got == expected and not any(type(g) is bool for g in got):
        return True                         # the common case, compared in C
    for k, (g, e) in enumerate(zip(got, expected)):
        if (g != e or type(g) is not type(e)) and not same(g, e):
            return ("Call #" + str(k) + " " + ops[k] + "(" + ", ".join(map(str, xs[k])) + ")"
                    + " returned " + show(g, 80) + ", expected " + show(e, 80) + ".")
    return True
