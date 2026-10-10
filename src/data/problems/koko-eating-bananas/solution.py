class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        # hours(k) never increases as k grows, so the speeds that work are
        # exactly [answer, max(piles)]. Binary search for where that range starts.
        lo, hi = 1, max(piles)       # at speed max(piles) each pile takes one hour, and len(piles) <= h
        while lo < hi:
            k = (lo + hi) // 2
            hours = sum((p + k - 1) // k for p in piles)   # ceil(p / k), in integers
            if hours <= h:
                hi = k               # k works: the answer is k or slower
            else:
                lo = k + 1           # k is too slow
        return lo
