# Only ever considers indices 0..len(nums)-1, so it can never answer len(nums):
# a target bigger than everything gets the last index instead.
class Solution:
    def searchInsert(self, nums, target):
        lo, hi = 0, len(nums) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid
        return lo
