# On a match it adds 1 to the best of the up/left neighbours instead of the
# diagonal, so one letter of a pair gets matched again: "aa" vs "a" gives 2.
class Solution:
    def longestCommonSubsequence(self, text1, text2):
        m, n = len(text1), len(text2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if text1[i - 1] == text2[j - 1]:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]) + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        return dp[m][n]
