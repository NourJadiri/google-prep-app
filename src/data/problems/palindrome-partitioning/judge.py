# Every test is checked here. The two largest carry `expected: null` (sixteen
# equal letters have 32,768 partitions, too many to store); for those an
# answer passes when every partition is valid, none repeats, and there are as
# many as a small DP counts. Checking each partition also lets a failure say
# exactly what is wrong.


def count_partitions(s):
    n = len(s)
    ways = [0] * (n + 1)        # ways[i]: partitions of s[i:]
    ways[n] = 1
    for i in range(n - 1, -1, -1):
        for j in range(i + 1, n + 1):
            piece = s[i:j]
            if piece == piece[::-1]:
                ways[i] += ways[j]
    return ways[0]


def problem(parts, s):
    """Why `parts` isn't a palindrome partition of s, or None when it is."""
    if not isinstance(parts, list) or not all(isinstance(p, str) for p in parts):
        return show(parts, 160) + " is not a list of strings."
    if "".join(parts) != s:
        return show(parts, 160) + " doesn't spell out s when joined back together."
    for p in parts:
        if p == "":
            return show(parts, 160) + " contains an empty piece."
        if p != p[::-1]:
            return show(parts, 160) + ": " + show(p) + " is not a palindrome."
    return None


def check(got, expected, args):
    s = args[0]
    if not isinstance(got, list):
        return "Return a list of partitions; got " + show(got, 80) + "."
    seen = set()
    for parts in got:
        why = problem(parts, s)
        if why:
            return why
        key = tuple(parts)
        if key in seen:
            return "The partition " + show(parts, 160) + " appears more than once."
        seen.add(key)
    total = count_partitions(s) if expected is None else len(expected)
    if len(got) != total:
        message = "Found " + str(len(got)) + " of the " + str(total) + " partitions."
        for parts in expected or []:
            if tuple(parts) not in seen:
                return message + " Missing, for one: " + show(parts, 160) + "."
        return message
    return True
