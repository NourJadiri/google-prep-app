# Try every possible answer: each step difference in the grid (and 0), from
# smallest up. The first limit under which the corner is reachable, using only
# steps no harder than the limit, is the minimum effort.
class Solution:
    def minimumEffortPath(self, heights):
        rows, cols = len(heights), len(heights[0])
        limits = {0}
        for r in range(rows):
            for c in range(cols):
                if r + 1 < rows:
                    limits.add(abs(heights[r][c] - heights[r + 1][c]))
                if c + 1 < cols:
                    limits.add(abs(heights[r][c] - heights[r][c + 1]))
        for limit in sorted(limits):
            seen = {(0, 0)}
            stack = [(0, 0)]
            while stack:
                r, c = stack.pop()
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if (0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen
                            and abs(heights[nr][nc] - heights[r][c]) <= limit):
                        seen.add((nr, nc))
                        stack.append((nr, nc))
            if (rows - 1, cols - 1) in seen:
                return limit
