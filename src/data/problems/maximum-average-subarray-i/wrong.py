# Starts the best sum at 0, as if some window always reaches it. When every
# window's sum is negative, nothing beats 0 and the answer comes out 0.0.
class Solution:
    def findMaxAverage(self, nums, k):
        window = 0
        best = 0
        for i, x in enumerate(nums):
            window += x
            if i >= k:
                window -= nums[i - k]
            if i >= k - 1:
                best = max(best, window)
        return best / k
