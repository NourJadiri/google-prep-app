# Every test is checked here. n = 9 and n = 10 carry `expected: null` (4,862
# and 16,796 strings would bloat the spec); there an answer passes when every
# string is balanced with n pairs, none repeats, and there are Catalan(n) of
# them. Checking each string also lets a failure say exactly what is wrong.
import math


def problem(s, n):
    """Why `s` isn't a balanced string of n pairs, or None when it is."""
    if not isinstance(s, str):
        return show(s, 80) + " is not a string."
    if len(s) != 2 * n or set(s) - set("()"):
        return show(s, 80) + " is not made of " + str(n) + " pairs of parentheses."
    depth = 0
    for ch in s:
        depth += 1 if ch == "(" else -1
        if depth < 0:
            return show(s) + " closes a parenthesis that was never opened."
    if depth != 0:
        return show(s) + " leaves a parenthesis open."
    return None


def check(got, expected, args):
    n = args[0]
    if not isinstance(got, list):
        return "Return a list of strings; got " + show(got, 80) + "."
    seen = set()
    for s in got:
        why = problem(s, n)
        if why:
            return why
        if s in seen:
            return show(s) + " appears more than once."
        seen.add(s)
    total = math.comb(2 * n, n) // (n + 1) if expected is None else len(expected)
    if len(got) != total:
        message = "Found " + str(len(got)) + " of the " + str(total) + " balanced strings."
        for s in expected or []:
            if s not in seen:
                return message + " Missing, for one: " + show(s) + "."
        return message
    return True
