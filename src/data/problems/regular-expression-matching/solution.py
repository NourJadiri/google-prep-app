class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        # match[i][j]: does the suffix s[i:] match the suffix p[j:]?
        match = [[False] * (n + 1) for _ in range(m + 1)]
        match[m][n] = True                       # empty string, empty pattern
        for i in range(m, -1, -1):               # i == m: s is used up
            for j in range(n - 1, -1, -1):
                first = i < m and p[j] in (s[i], ".")
                if j + 1 < n and p[j + 1] == "*":
                    # "x*" either matches nothing (skip both characters), or
                    # matches s[i] and stays available for the rest of s.
                    match[i][j] = match[i][j + 2] or (first and match[i + 1][j])
                else:
                    match[i][j] = first and match[i + 1][j + 1]
        return match[0][0]
