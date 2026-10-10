class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        # Invariant: everything left of lo is smaller than target, and
        # everything right of hi is bigger.
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        # The loop ends with lo == hi + 1: everything before lo is smaller and
        # everything from lo on is bigger, so lo is exactly where target belongs.
        return lo
