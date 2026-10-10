class Solution:
    def maximalSquare(self, matrix):
        m, n = len(matrix), len(matrix[0])
        best = 0
        # Every top-left corner, every size that fits: check each cell.
        for top in range(m):
            for left in range(n):
                for size in range(1, min(m - top, n - left) + 1):
                    if all(matrix[r][c] == "1"
                           for r in range(top, top + size)
                           for c in range(left, left + size)):
                        best = max(best, size * size)
        return best
