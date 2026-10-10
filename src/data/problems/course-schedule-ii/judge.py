# Any valid order passes. `expected` is the reference's answer and is used
# only to know whether an order exists at all: it's [] exactly when the
# prerequisites loop.


def check(got, expected, args):
    n, pairs = args
    if expected == []:
        if got == []:
            return True
        return ("No order exists, because some prerequisites form a loop. "
                "The answer is [], but you returned " + show(got) + ".")
    if not isinstance(got, list):
        return "Expected a list of course numbers, got " + show(got) + "."
    if got == []:
        return "An order exists (for example " + show(expected) + "), but you returned []."
    if len(got) != n or any(type(c) is not int for c in got) or sorted(got) != list(range(n)):
        return ("The order must list each of the " + str(n) + " courses exactly once. "
                "You returned " + show(got) + ".")
    position = {c: i for i, c in enumerate(got)}
    for a, b in pairs:
        if position[b] > position[a]:
            return "Course " + str(a) + " comes before its prerequisite " + str(b) + "."
    return True
