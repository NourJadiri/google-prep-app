# The large tests hold a solution to O(log n). Their `target` is a list: the
# same array is searched once per target, so a linear scan pays for the whole
# array ten thousand times while a binary search pays seventeen steps. Their
# expected answers are computed here from a value -> index map rather than
# stored in the spec.

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
        where = {x: i for i, x in enumerate(nums)}
        expected = [where.get(t, -1) for t in target]
    for t, g, e in zip(target, got, expected):
        if not same(g, e):
            return "search(nums, " + str(t) + ") returned " + show(g) + ", expected " + str(e) + "."
    return True
