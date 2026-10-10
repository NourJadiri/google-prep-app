# Any arrangement with no two equal neighbours is a right answer, so the
# expected string in the spec is only one of many. The verdict comes from s
# itself: when some letter needs more than half the slots (rounded up), ""
# is the only right answer; otherwise the answer must use exactly the
# letters of s, with no two equal letters side by side.

def check(got, expected, args):
    s = args[0]
    n = len(s)
    counts = Counter(s)
    top, top_count = counts.most_common(1)[0]
    room = (n + 1) // 2
    if not isinstance(got, str):
        return "Expected a string, got " + show(got, 80) + "."
    if top_count > room:
        if got == "":
            return True
        return ("No arrangement exists: '" + top + "' appears " + str(top_count) + " times in "
                + str(n) + " letters, but at most " + str(room) + " can avoid touching. Expected \"\".")
    if got == "":
        return "A valid arrangement exists (for example " + show(expected, 80) + "), but you returned \"\"."
    if Counter(got) != counts:
        return "That isn't a rearrangement of s: the letters or their counts differ."
    for i in range(1, n):
        if got[i] == got[i - 1]:
            return "Positions " + str(i - 1) + " and " + str(i) + " are both '" + got[i] + "'."
    return True
