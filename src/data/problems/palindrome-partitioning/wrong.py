# Fills the palindrome table top-down, so pal[i + 1][j - 1] is still False
# when pal[i][j] reads it: only pieces of length 1 and 2 are ever found.
class Solution:
    def partition(self, s):
        n = len(s)
        pal = [[False] * n for _ in range(n)]
        for i in range(n):
            for j in range(i, n):
                pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])
        out, path = [], []

        def backtrack(start):
            if start == n:
                out.append(path[:])
                return
            for end in range(start, n):
                if pal[start][end]:
                    path.append(s[start:end + 1])
                    backtrack(end + 1)
                    path.pop()

        backtrack(0)
        return out
