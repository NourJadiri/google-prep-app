# Adds nums[i] to the left sum before comparing, so the candidate's own value
# is counted on the left side.
class Solution:
    def pivotIndex(self, nums):
        total = sum(nums)
        left = 0
        for i, x in enumerate(nums):
            left += x
            if left == total - left:
                return i
        return -1
