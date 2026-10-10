# Returns the first index PAST the run as the last position: forgets the - 1.
class Solution:
    def searchRange(self, nums, target):
        def lower(x):
            lo, hi = 0, len(nums)
            while lo < hi:
                mid = (lo + hi) // 2
                if nums[mid] < x:
                    lo = mid + 1
                else:
                    hi = mid
            return lo

        first = lower(target)
        if first == len(nums) or nums[first] != target:
            return [-1, -1]
        return [first, lower(target + 1)]
