# The large tests would need 100,000 expected numbers each, so they carry
# null and their answers are computed here — by a different method from the
# usual stack: walk backwards, and from each day hop along the answers already
# known for the days after it.

def waits(temps):
    n = len(temps)
    out = [0] * n
    for i in range(n - 2, -1, -1):
        j = i + 1
        while j < n and temps[j] <= temps[i]:
            if out[j] == 0:      # nothing after j is warmer than j, so nothing beats i
                j = n
            else:
                j += out[j]      # skip to the first day warmer than j
        if j < n:
            out[i] = j - i
    return out


def check(got, expected, args):
    if expected is None:
        expected = waits(args[0])
    if not isinstance(got, list):
        return "Expected a list of numbers, got " + show(got, 80) + "."
    if len(got) != len(expected):
        return ("Returned " + str(len(got)) + " numbers for " + str(len(expected)) + " days.")
    if got == expected and all(type(g) is int for g in got):
        return True
    for i, (g, e) in enumerate(zip(got, expected)):
        if not same(g, e):
            return "answer[" + str(i) + "] is " + show(g, 80) + ", expected " + str(e) + "."
    return True
