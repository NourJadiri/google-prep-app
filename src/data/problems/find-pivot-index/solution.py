class Solution:
    def pivotIndex(self, nums: List[int]) -> int:
        total = sum(nums)
        left = 0                               # sum of nums[:i]
        for i, x in enumerate(nums):
            # left + x + right == total, so the right side is total - left - x.
            if left == total - left - x:
                return i                       # the first hit is the leftmost pivot
            left += x                          # only now does nums[i] join the left side
        return -1
