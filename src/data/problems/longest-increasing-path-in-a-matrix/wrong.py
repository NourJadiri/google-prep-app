# Uses a visited set the way a flood fill does: a cell explored once is never
# entered again, even when a later start could have built a longer path
# through it. Fast, and wrong.
class Solution:
    def longestIncreasingPath(self, matrix):
        m, n = len(matrix), len(matrix[0])
        seen = set()

        def dfs(r, c):
            seen.add((r, c))
            best = 1
            for x, y in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= x < m and 0 <= y < n and (x, y) not in seen \
                        and matrix[x][y] > matrix[r][c]:
                    best = max(best, 1 + dfs(x, y))
            return best

        return max(dfs(r, c) for r in range(m) for c in range(n) if (r, c) not in seen)
