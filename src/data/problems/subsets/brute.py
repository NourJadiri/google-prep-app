class Solution:
    def subsets(self, nums):
        # Bit i of mask says whether nums[i] is in the subset.
        n = len(nums)
        return [[nums[i] for i in range(n) if mask >> i & 1] for mask in range(1 << n)]
