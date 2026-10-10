# Not a linear scan: the tests cap the number of isBadVersion calls, so the
# independent check leans on the standard library instead. bisect_left over
# versions 1..n, keyed by the API, finds the first one whose answer is True.
from bisect import bisect_left


class Solution:
    def firstBadVersion(self, n):
        return 1 + bisect_left(range(1, n + 1), True, key=isBadVersion)
