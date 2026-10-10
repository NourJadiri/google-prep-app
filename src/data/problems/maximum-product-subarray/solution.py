class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        # hi / lo: the largest and smallest product of a subarray that ends at
        # the current element. A negative x turns the smallest into the largest,
        # so both are needed.
        hi = lo = best = nums[0]
        for x in nums[1:]:
            candidates = (x, hi * x, lo * x)    # start fresh, or extend either one
            hi, lo = max(candidates), min(candidates)   # both from the *old* pair
            best = max(best, hi)
        return best
