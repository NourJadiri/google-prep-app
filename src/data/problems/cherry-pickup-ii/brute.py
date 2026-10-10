class Solution:
    def cherryPickup(self, grid):
        # Try every combination of moves for the two robots, row by row.
        rows, cols = len(grid), len(grid[0])
        best = 0

        def walk(r, a, b, total):
            nonlocal best
            total += grid[r][a] + (grid[r][b] if a != b else 0)
            if r == rows - 1:
                best = max(best, total)
                return
            for na in (a - 1, a, a + 1):
                for nb in (b - 1, b, b + 1):
                    if 0 <= na < cols and 0 <= nb < cols:
                        walk(r + 1, na, nb, total)

        walk(0, 0, cols - 1, 0)
        return best
