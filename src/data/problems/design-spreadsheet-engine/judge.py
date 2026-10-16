# Most tests carry their expected outputs. The 30,000-read chain carries null
# and is checked against this simulation instead, so the spec doesn't have to
# store thirty thousand answers. The test only ever sets the chain's head to a
# number, so every cell's value is a closed form: A_i = head + (i - 1).


def simulate(ops, args):
    head, length, out = 0, 0, []
    for op, a in zip(ops, args):
        if op == "set":
            cell, value = a
            if cell == "A1":
                head = value
            length = max(length, int(cell[1:]))
            out.append(True)
        elif op == "get":
            i = int(a[0][1:])
            out.append(head + (i - 1) if i <= length else 0)
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
            return ("Call #" + str(k) + " " + ops[k] + "(" + ", ".join(map(show, xs[k])) + ")"
                    + " returned " + show(g) + ", expected " + show(e) + ".")
    return True
