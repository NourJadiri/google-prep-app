class Solution:
    def missingNumber(self, nums):
        for v in range(len(nums) + 1):
            if v not in nums:
                return v
