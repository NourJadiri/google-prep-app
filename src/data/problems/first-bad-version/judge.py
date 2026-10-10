# isBadVersion is built here from `bad`, which the solution never sees, and
# installed as a global in the solution's module, the way LeetCode provides
# it. Every call is counted: binary search needs about log2(n) of them, so a
# run that goes past 2 * ceil(log2(n)) + 2 is stopped with a message. That
# also turns a search that loops forever into a quick, clear failure.


class TooManyCalls(Exception):
    pass


# Shown to the user as "TooManyCalls: ..." rather than "judge.TooManyCalls: ...".
TooManyCalls.__module__ = "builtins"


def run(fn, args):
    n, bad = args
    if not (type(n) is int and type(bad) is int and 1 <= bad <= n):
        raise ValueError("this input needs whole numbers with 1 <= bad <= n")
    steps = max((n - 1).bit_length(), 1)  # ceil(log2(n)), but at least 1
    limit = 2 * (n - 1).bit_length() + 2
    calls = 0

    def isBadVersion(version):
        nonlocal calls
        calls += 1
        if calls > limit:
            raise TooManyCalls(
                "isBadVersion was called more than " + str(limit) + " times for n = " + str(n)
                + ". Binary search needs about " + str(steps) + (" call." if steps == 1 else " calls.")
                + " Is your search range shrinking on every step?")
        return version >= bad

    getattr(fn, "__func__", fn).__globals__["isBadVersion"] = isBadVersion
    return fn(n)
