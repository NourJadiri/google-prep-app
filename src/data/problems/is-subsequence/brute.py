class Solution:
    def isSubsequence(self, s, t):
        # can[i][j]: is s[:i] a subsequence of t[:j]?
        can = [[False] * (len(t) + 1) for _ in range(len(s) + 1)]
        for j in range(len(t) + 1):
            can[0][j] = True
        for i in range(1, len(s) + 1):
            for j in range(1, len(t) + 1):
                can[i][j] = can[i][j - 1] or (s[i - 1] == t[j - 1] and can[i - 1][j - 1])
        return can[len(s)][len(t)]
