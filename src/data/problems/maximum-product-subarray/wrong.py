# Updates hi first and then computes lo from the *new* hi, so lo can claim a
# product no subarray ending here actually has.
class Solution:
    def maxProduct(self, nums):
        hi = lo = best = nums[0]
        for x in nums[1:]:
            hi = max(x, hi * x, lo * x)
            lo = min(x, hi * x, lo * x)
            best = max(best, hi)
        return best
