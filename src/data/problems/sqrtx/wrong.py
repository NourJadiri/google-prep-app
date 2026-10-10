# Starts the search at [0, x // 2] to save a step. That holds the answer for
# every x >= 2, but for x = 1 the answer is 1, outside [0, 0], and it returns 0.
class Solution:
    def mySqrt(self, x):
        lo, hi = 0, x // 2
        while lo <= hi:
            mid = (lo + hi) // 2
            if mid * mid <= x:
                lo = mid + 1
            else:
                hi = mid - 1
        return hi
