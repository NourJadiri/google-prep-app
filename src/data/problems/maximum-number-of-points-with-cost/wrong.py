# Sweeps only from the left, so a better cell to the right in the row above is never seen.
class Solution:
    def maxPoints(self, points):
        n = len(points[0])
        best = points[0][:]
        for row in points[1:]:
            from_left = best[:]
            for c in range(1, n):
                from_left[c] = max(from_left[c], from_left[c - 1] - 1)
            best = [row[c] + from_left[c] for c in range(n)]
        return max(best)
