class Solution:
    def sortedSquares(self, nums):
        return sorted(x * x for x in nums)
