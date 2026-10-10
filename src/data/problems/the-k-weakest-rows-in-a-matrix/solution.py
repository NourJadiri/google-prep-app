class Solution:
    def kWeakestRows(self, mat: List[List[int]], k: int) -> List[int]:
        def soldiers(row):
            # The 1s come first, so the count is the position of the first 0.
            # It lies in [lo, hi]; hi = len(row) means the row has no 0 at all.
            lo, hi = 0, len(row)
            while lo < hi:
                mid = (lo + hi) // 2
                if row[mid] == 1:
                    lo = mid + 1        # the first 0 is further right
                else:
                    hi = mid            # mid is a 0: the first one is here or left
            return lo

        # Tuples compare item by item, so (soldiers, index) orders rows exactly
        # as "weaker" is defined: fewer soldiers first, then the smaller index.
        strength = [(soldiers(row), i) for i, row in enumerate(mat)]
        return [i for _, i in heapq.nsmallest(k, strength)]
