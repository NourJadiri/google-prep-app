class Solution:
    def searchInsert(self, nums, target):
        for i, x in enumerate(nums):
            if x >= target:
                return i
        return len(nums)
