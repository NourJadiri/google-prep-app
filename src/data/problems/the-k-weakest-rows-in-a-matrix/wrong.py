# A binary search that can never report a full row: starting with
# hi = len(row) - 1, a row of all soldiers is counted one short.
class Solution:
    def kWeakestRows(self, mat, k):
        def soldiers(row):
            lo, hi = 0, len(row) - 1
            while lo < hi:
                mid = (lo + hi) // 2
                if row[mid] == 1:
                    lo = mid + 1
                else:
                    hi = mid
            return lo

        strength = sorted((soldiers(row), i) for i, row in enumerate(mat))
        return [i for _, i in strength[:k]]
