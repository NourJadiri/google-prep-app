# Lets water flow only to strictly lower cells, so it can't cross flat ground.
class Solution:
    def pacificAtlantic(self, heights):
        m, n = len(heights), len(heights[0])

        def climb(shore):
            seen = set(shore)
            stack = list(shore)
            while stack:
                r, c = stack.pop()
                for x, y in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= x < m and 0 <= y < n and (x, y) not in seen \
                            and heights[x][y] > heights[r][c]:
                        seen.add((x, y))
                        stack.append((x, y))
            return seen

        pac = climb([(0, c) for c in range(n)] + [(r, 0) for r in range(m)])
        atl = climb([(m - 1, c) for c in range(n)] + [(r, n - 1) for r in range(m)])
        return [[r, c] for r, c in pac & atl]
