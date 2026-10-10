# The isBadVersion API is already defined for you.
# def isBadVersion(version: int) -> bool:

class Solution:
    def firstBadVersion(self, n: int) -> int:
        lo, hi = 1, n
        # Invariant: every version before lo is good, every version after hi is bad.
        while lo <= hi:
            mid = (lo + hi) // 2
            if isBadVersion(mid):
                hi = mid - 1    # mid is bad, so the first bad version is mid or earlier
            else:
                lo = mid + 1    # mid is good, so the first bad version is later
        # lo == hi + 1: lo - 1 is good (or lo is 1) and lo is bad.
        return lo
