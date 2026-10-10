class Solution:
    def findTargetSumWays(self, nums, target):
        # Try both signs for every number: all 2^n patterns.
        def count(i, total):
            if i == len(nums):
                return 1 if total == target else 0
            return count(i + 1, total + nums[i]) + count(i + 1, total - nums[i])

        return count(0, 0)
