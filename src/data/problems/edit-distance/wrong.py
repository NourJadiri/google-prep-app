# Forgets replacement: a substitution costs a delete plus an insert (m + n - 2 * LCS).
class Solution:
    def minDistance(self, word1, word2):
        m, n = len(word1), len(word2)
        lcs = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m):
            for j in range(n):
                if word1[i] == word2[j]:
                    lcs[i + 1][j + 1] = lcs[i][j] + 1
                else:
                    lcs[i + 1][j + 1] = max(lcs[i][j + 1], lcs[i + 1][j])
        return m + n - 2 * lcs[m][n]
