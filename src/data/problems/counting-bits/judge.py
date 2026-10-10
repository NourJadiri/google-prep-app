# Most tests carry their expected lists. The two largest carry null, so the
# spec doesn't have to store 100,001 numbers; those are checked against a
# direct count here instead. Either way, a failure names the first wrong entry.


def check(got, expected, args):
    n = args[0]
    if expected is None:
        expected = [bin(i).count("1") for i in range(n + 1)]
    if not isinstance(got, list):
        return "Expected a list of " + format(n + 1, ",") + " counts, got " + show(got, 80) + "."
    if len(got) != len(expected):
        return ("The list needs n + 1 = " + format(len(expected), ",") + " entries, one for each number from 0 to n;"
                + " yours has " + format(len(got), ",") + ".")
    for i, (g, e) in enumerate(zip(got, expected)):
        if not same(g, e):
            return ("ans[" + str(i) + "] is " + show(g, 80) + ", expected " + str(e)
                    + " (" + str(i) + " is " + bin(i)[2:] + " in binary).")
    return True
