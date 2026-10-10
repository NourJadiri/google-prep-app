# Bottom-up by value: visit cells from smallest to largest, so every strictly
# smaller neighbour is finished first, and record the longest increasing path
# that ENDS at each cell.
class Solution:
    def longestIncreasingPath(self, matrix):
        m, n = len(matrix), len(matrix[0])
        ending = {}
        for v, r, c in sorted((matrix[r][c], r, c) for r in range(m) for c in range(n)):
            best = 1
            for x, y in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= x < m and 0 <= y < n and matrix[x][y] < v:
                    best = max(best, ending[(x, y)] + 1)
            ending[(r, c)] = best
        return max(ending.values())
