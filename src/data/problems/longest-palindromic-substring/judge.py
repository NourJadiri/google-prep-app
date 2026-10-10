# Several substrings can tie for the longest (in "zq" both letters do), so any
# palindromic substring of the maximum length passes. `expected` is the one the
# reference found; only its length matters here.

def check(got, expected, args):
    s = args[0]
    if not isinstance(got, str):
        return "Expected a string, got " + show(got) + "."
    if got not in s:
        return show(got) + " isn't a substring of s."
    if got != got[::-1]:
        return show(got) + " isn't a palindrome."
    if len(got) != len(expected):
        return (show(got) + " has length " + str(len(got)) + ", but the longest palindromic substring has length "
                + str(len(expected)) + " (for example " + show(expected) + ").")
    return True
