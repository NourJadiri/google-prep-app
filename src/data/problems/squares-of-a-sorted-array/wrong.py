# Compares the end values instead of their sizes. In a sorted list the left
# end is never the bigger value, so this always takes from the right: it just
# squares in the original order, and negatives come out in the wrong place.
class Solution:
    def sortedSquares(self, nums):
        result = [0] * len(nums)
        lo, hi = 0, len(nums) - 1
        for write in range(len(nums) - 1, -1, -1):
            if nums[lo] > nums[hi]:
                result[write] = nums[lo] * nums[lo]
                lo += 1
            else:
                result[write] = nums[hi] * nums[hi]
                hi -= 1
        return result
