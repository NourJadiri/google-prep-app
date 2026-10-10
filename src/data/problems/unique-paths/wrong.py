# Cells vs moves: builds an (m + 1) x (n + 1) table as if the robot made m
# moves down and n moves right. An m x n grid only needs m - 1 and n - 1.
class Solution:
    def uniquePaths(self, m, n):
        dp = [[1] * (n + 1) for _ in range(m + 1)]
        for r in range(1, m + 1):
            for c in range(1, n + 1):
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
        return dp[m][n]
