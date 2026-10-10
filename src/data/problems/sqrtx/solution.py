class Solution:
    def mySqrt(self, x: int) -> int:
        # We want the largest k with k * k <= x. Squares grow with k, so the
        # question "is k * k <= x?" goes yes, yes, ..., yes, no, no:
        # binary search for the last yes.
        lo, hi = 0, x
        while lo <= hi:
            mid = (lo + hi) // 2
            if mid * mid <= x:
                lo = mid + 1    # mid fits, so the answer is mid or bigger
            else:
                hi = mid - 1    # mid is too big, so the answer is smaller
        # lo == hi + 1: every k up to hi fits, and every k from lo on doesn't.
        return hi
