# Floors p / k: a pile of 7 at speed 3 really takes 3 hours (3 + 3 + 1), not 2.
# The hours come out too low, and so does the speed.
class Solution:
    def minEatingSpeed(self, piles, h):
        lo, hi = 1, max(piles)
        while lo < hi:
            k = (lo + hi) // 2
            if sum(p // k for p in piles) <= h:
                hi = k
            else:
                lo = k + 1
        return lo
