# The large tests hold a solution to O(log n). Their `target` is a list: the
# same array is searched once per target, so a scan — or a walk outward from
# any copy across a run ten thousand long — pays for it ten thousand times.
# Their expected answers are computed here with bisect rather than stored in
# the spec.

def run(fn, args):
    nums, target = args
    if isinstance(target, list):
        return [fn(nums, t) for t in target]
    return fn(nums, target)


def check(got, expected, args):
    nums, target = args
    if not isinstance(target, list):
        return same(got, expected)
    if expected is None:
        expected = []
        for t in target:
            lo, hi = bisect_left(nums, t), bisect_right(nums, t)
            expected.append([lo, hi - 1] if lo < hi else [-1, -1])
    for t, g, e in zip(target, got, expected):
        if not same(g, e):
            return "searchRange(nums, " + str(t) + ") returned " + show(g) + ", expected " + show(e) + "."
    return True
