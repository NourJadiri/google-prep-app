class Solution:

    def __init__(self, w: List[int]):
        # prefix[i] = w[0] + ... + w[i]. Index i owns the integers
        # prefix[i-1] + 1 .. prefix[i] — exactly w[i] of them.
        self.prefix = list(accumulate(w))

    def pickIndex(self) -> int:
        target = random.randint(1, self.prefix[-1])
        # The owner of `target` is the first index whose prefix sum reaches it.
        return bisect_left(self.prefix, target)
