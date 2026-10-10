# Binary-search habit: hi = mid - 1 on a falling step. But mid itself may be
# the peak, and skipping it can leave a range with no peak in it.
class Solution:
    def findPeakElement(self, nums):
        lo, hi = 0, len(nums) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] < nums[mid + 1]:
                lo = mid + 1
            else:
                hi = mid - 1
        return lo
