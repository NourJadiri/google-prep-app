# Mixes two binary-search styles: an inclusive loop (lo <= hi) with hi = mid.
# Once lo == hi lands on the first bad version, nothing changes and the loop
# never ends (the call counter stops it).
class Solution:
    def firstBadVersion(self, n):
        lo, hi = 1, n
        while lo <= hi:
            mid = (lo + hi) // 2
            if isBadVersion(mid):
                hi = mid
            else:
                lo = mid + 1
        return lo
