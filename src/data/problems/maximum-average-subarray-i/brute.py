class Solution:
    def findMaxAverage(self, nums, k):
        return max(sum(nums[start:start + k]) / k for start in range(len(nums) - k + 1))
