class Solution:
    def swimInWater(self, grid: List[List[int]]) -> int:
        n = len(grid)
        # Flood outward from (0, 0), always taking the lowest cell on the
        # border of what's reachable. A cell's cost is its own elevation, not
        # the route to it, so marking it when it's pushed is safe.
        seen = {(0, 0)}
        border = [(grid[0][0], 0, 0)]
        level = 0                          # the water level needed so far
        while True:                        # the target is always reachable
            height, r, c = heappop(border)
            level = max(level, height)
            if r == n - 1 and c == n - 1:
                return level
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    heappush(border, (grid[nr][nc], nr, nc))
