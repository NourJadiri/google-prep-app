# Sorts and checks pairs (0,1), (2,3), ... but never looks at the last
# element on its own, so it returns None when the single number is the largest.
class Solution:
    def singleNumber(self, nums):
        nums = sorted(nums)
        for i in range(0, len(nums) - 1, 2):
            if nums[i] != nums[i + 1]:
                return nums[i]
