class Solution:
    def numberOfPatterns(self, m: int, n: int) -> int:
        # skip[a][b]: the dot a straight move a -> b passes through (0 if none).
        skip = [[0] * 10 for _ in range(10)]
        for a, b, mid in ((1, 3, 2), (4, 6, 5), (7, 9, 8),      # rows
                          (1, 7, 4), (2, 8, 5), (3, 9, 6),      # columns
                          (1, 9, 5), (3, 7, 5)):                # diagonals
            skip[a][b] = skip[b][a] = mid
        used = [False] * 10

        def count(dot, length):
            """Valid patterns that extend the current path, which ends at `dot`
            and is `length` dots long — the path itself included."""
            total = 1 if length >= m else 0
            if length == n:
                return total
            used[dot] = True
            for nxt in range(1, 10):
                if not used[nxt] and (skip[dot][nxt] == 0 or used[skip[dot][nxt]]):
                    total += count(nxt, length + 1)
            used[dot] = False
            return total

        # The grid's symmetries map corners onto corners and edges onto edges,
        # so one corner and one edge stand in for four each.
        return 4 * count(1, 1) + 4 * count(2, 1) + count(5, 1)
