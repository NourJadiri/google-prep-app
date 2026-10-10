class Solution:
    def partition(self, s: str) -> List[List[str]]:
        n = len(s)
        # pal[i][j]: is s[i..j] a palindrome? Filled from the right, so that
        # pal[i + 1][j - 1] is ready by the time pal[i][j] needs it.
        pal = [[False] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):
            for j in range(i, n):
                pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])

        out, path = [], []

        def backtrack(start):
            if start == n:
                out.append(path[:])
                return
            for end in range(start, n):
                if pal[start][end]:                 # prune: only palindromic pieces
                    path.append(s[start:end + 1])   # choose the next piece
                    backtrack(end + 1)              # explore the rest of the string
                    path.pop()                      # un-choose

        backtrack(0)
        return out
