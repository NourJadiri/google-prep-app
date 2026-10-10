# Sets up the table's first two answers without checking n: a one-step
# staircase has no dp[2], so it crashes.
class Solution:
    def climbStairs(self, n):
        dp = [0] * (n + 1)
        dp[1] = 1
        dp[2] = 2
        for i in range(3, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
        return dp[n]
