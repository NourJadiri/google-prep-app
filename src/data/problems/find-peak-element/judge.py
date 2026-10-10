# Any peak is a right answer, so the returned index is checked against the
# input instead of being compared with one stored answer.


def check(got, expected, args):
    nums = args[0]
    n = len(nums)
    if isinstance(got, bool) or not isinstance(got, int):
        return "Expected an index (an int), got " + show(got) + "."
    if not 0 <= got < n:
        return "Index " + str(got) + " is out of range for an array of length " + str(n) + "."
    for j, side in ((got - 1, "left"), (got + 1, "right")):
        if 0 <= j < n and nums[j] >= nums[got]:
            return ("Index " + str(got) + " isn't a peak: nums[" + str(got) + "] = " + str(nums[got])
                    + ", but its " + side + " neighbour nums[" + str(j) + "] = " + str(nums[j]) + ".")
    return True
