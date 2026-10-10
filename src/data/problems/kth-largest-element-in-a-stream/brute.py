class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.scores = list(nums)

    def add(self, val):
        # Keep every score; sort from largest to smallest and read position k.
        self.scores.append(val)
        return sorted(self.scores, reverse=True)[self.k - 1]
