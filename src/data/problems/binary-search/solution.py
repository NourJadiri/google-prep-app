class Solution:
    def search(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1       # if target is anywhere, it's in nums[lo..hi]
        while lo <= hi:                 # the range still holds at least one element
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[mid] < target:
                lo = mid + 1            # mid and everything to its left are too small
            else:
                hi = mid - 1            # mid and everything to its right are too big
        return -1                       # the range is empty: target isn't there
