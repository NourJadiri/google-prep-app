# Counts a cell twice when both robots stand on it.
class Solution:
    def cherryPickup(self, grid):
        rows, cols = len(grid), len(grid[0])
        near = [[d for d in (c - 1, c, c + 1) if 0 <= d < cols] for c in range(cols)]
        best = [[-1] * cols for _ in range(cols)]
        best[0][cols - 1] = grid[0][0] + grid[0][cols - 1]
        for row in grid[1:]:
            nxt = [[-1] * cols for _ in range(cols)]
            for a in range(cols):
                for b in range(cols):
                    prev = max(best[pa][pb] for pa in near[a] for pb in near[b])
                    if prev >= 0:
                        nxt[a][b] = prev + row[a] + row[b]
            best = nxt
        return max(map(max, best))
