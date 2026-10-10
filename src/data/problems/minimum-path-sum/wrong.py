# Pads the table with a border of zeros so the first row and column need no
# special case -- but a zero border is a free way in, so the top row and the
# left column forget everything paid before them.
class Solution:
    def minPathSum(self, grid):
        m, n = len(grid), len(grid[0])
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for r in range(1, m + 1):
            for c in range(1, n + 1):
                dp[r][c] = grid[r - 1][c - 1] + min(dp[r - 1][c], dp[r][c - 1])
        return dp[m][n]
