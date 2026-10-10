# The large tests carry null: their expected output (tens of thousands of
# maxima) is computed here instead of being stored in the spec, with the block
# method. Cut nums into blocks of k; any window spans at most two blocks, so
# its maximum is (max from its start to the end of its block) combined with
# (max from the start of the next block to its end).


def window_maxima(nums, k):
    n = len(nums)
    left, right = nums[:], nums[:]
    for i in range(1, n):
        if i % k:
            left[i] = max(left[i - 1], nums[i])
    for i in range(n - 2, -1, -1):
        if (i + 1) % k:
            right[i] = max(right[i + 1], nums[i])
    return [max(right[i], left[i + k - 1]) for i in range(n - k + 1)]


def check(got, expected, args):
    if expected is None:
        expected = window_maxima(*args)
    if same(got, expected):
        return True
    if not isinstance(got, list):
        return False
    if len(got) != len(expected):
        return ("Returned " + str(len(got)) + " values, expected " + str(len(expected))
                + " (one per window position).")
    i = next(i for i, (g, e) in enumerate(zip(got, expected)) if not same(g, e))
    return ("Window starting at index " + str(i) + ": got " + show(got[i])
            + ", expected " + show(expected[i]) + ".")
