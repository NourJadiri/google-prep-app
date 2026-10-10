# Only ever moves right or down, like "minimum path sum". The best route may
# have to double back up or to the left.
class Solution:
    def minimumEffortPath(self, heights):
        rows, cols = len(heights), len(heights[0])
        best = [[float("inf")] * cols for _ in range(rows)]
        best[0][0] = 0
        for r in range(rows):
            for c in range(cols):
                if r > 0:
                    step = abs(heights[r][c] - heights[r - 1][c])
                    best[r][c] = min(best[r][c], max(best[r - 1][c], step))
                if c > 0:
                    step = abs(heights[r][c] - heights[r][c - 1])
                    best[r][c] = min(best[r][c], max(best[r][c - 1], step))
        return best[rows - 1][cols - 1]
