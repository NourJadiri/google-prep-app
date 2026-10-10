# Let the water rise one unit at a time; after each rise, search for a route
# through cells that are under water. The first time that works is the answer.
class Solution:
    def swimInWater(self, grid):
        n = len(grid)
        for t in range(n * n):
            if grid[0][0] > t:
                continue
            seen = {(0, 0)}
            stack = [(0, 0)]
            while stack:
                r, c = stack.pop()
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen and grid[nr][nc] <= t:
                        seen.add((nr, nc))
                        stack.append((nr, nc))
            if (n - 1, n - 1) in seen:
                return t
