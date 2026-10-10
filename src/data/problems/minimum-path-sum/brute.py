class Solution:
    def minPathSum(self, grid):
        m, n = len(grid), len(grid[0])
        best = None

        # Walk every right/down route and keep the cheapest total.
        def walk(r, c, cost):
            nonlocal best
            cost += grid[r][c]
            if r == m - 1 and c == n - 1:
                if best is None or cost < best:
                    best = cost
                return
            if r + 1 < m:
                walk(r + 1, c, cost)
            if c + 1 < n:
                walk(r, c + 1, cost)

        walk(0, 0, 0)
        return best
