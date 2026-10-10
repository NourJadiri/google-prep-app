# Skips an anchor when the NEXT value equals it, instead of the previous one.
# That discards the first copy of a repeated value — the only copy that can
# pair with its twin — so triples like [-1,-1,2] and [0,0,0] are never found.
class Solution:
    def threeSum(self, nums):
        nums = sorted(nums)
        n = len(nums)
        res = []
        for i in range(n - 2):
            if nums[i] == nums[i + 1]:
                continue
            lo, hi = i + 1, n - 1
            while lo < hi:
                s = nums[i] + nums[lo] + nums[hi]
                if s < 0:
                    lo += 1
                elif s > 0:
                    hi -= 1
                else:
                    res.append([nums[i], nums[lo], nums[hi]])
                    lo += 1
                    hi -= 1
                    while lo < hi and nums[lo] == nums[lo - 1]:
                        lo += 1
        return res
