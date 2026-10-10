class Solution:
    def maxPoints(self, points):
        # Straight from the definition: for every cell, try every column of
        # the row above. O(m * n^2).
        n = len(points[0])
        best = points[0][:]
        for row in points[1:]:
            best = [row[c] + max(best[k] - abs(k - c) for k in range(n)) for c in range(n)]
        return max(best)
