from itertools import product


class Solution:
    def permute(self, nums):
        # Every sequence of n indices, kept when no index repeats.
        n = len(nums)
        return [[nums[i] for i in idx] for idx in product(range(n), repeat=n) if len(set(idx)) == n]
