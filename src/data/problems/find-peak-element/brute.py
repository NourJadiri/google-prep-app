class Solution:
    def findPeakElement(self, nums):
        n = len(nums)
        for i in range(n):
            left = nums[i - 1] if i > 0 else float("-inf")
            right = nums[i + 1] if i < n - 1 else float("-inf")
            if nums[i] > left and nums[i] > right:
                return i
        return -1
