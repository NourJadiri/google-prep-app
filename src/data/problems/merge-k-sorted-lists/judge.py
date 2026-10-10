# The large tests carry null: their expected output (10,000 values) is
# computed here from the input instead of being stored in the spec.


def check(got, expected, args):
    if expected is None:
        expected = sorted(v for values in args[0] for v in values)
    if same(got, expected):
        return True
    if not isinstance(got, list):
        return False
    if len(got) != len(expected):
        return "Returned " + str(len(got)) + " nodes, expected " + str(len(expected)) + "."
    k = next(i for i, (g, e) in enumerate(zip(got, expected)) if not same(g, e))
    return "Node #" + str(k) + " holds " + show(got[k]) + ", expected " + show(expected[k]) + "."
