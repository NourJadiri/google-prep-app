# Forgets the two diagonals: 1 -> 9 and 3 -> 7 pass through 5 too.
class Solution:
    def numberOfPatterns(self, m, n):
        skip = [[0] * 10 for _ in range(10)]
        for a, b, mid in ((1, 3, 2), (4, 6, 5), (7, 9, 8), (1, 7, 4), (2, 8, 5), (3, 9, 6)):
            skip[a][b] = skip[b][a] = mid
        used = [False] * 10

        def count(dot, length):
            total = 1 if length >= m else 0
            if length == n:
                return total
            used[dot] = True
            for nxt in range(1, 10):
                if not used[nxt] and (skip[dot][nxt] == 0 or used[skip[dot][nxt]]):
                    total += count(nxt, length + 1)
            used[dot] = False
            return total

        return 4 * count(1, 1) + 4 * count(2, 1) + count(5, 1)
