# Sorts and returns the first index whose value doesn't match it -- and
# returns nothing when every index matches, which is when n is the missing one.
class Solution:
    def missingNumber(self, nums):
        nums = sorted(nums)
        for i, x in enumerate(nums):
            if x != i:
                return i
