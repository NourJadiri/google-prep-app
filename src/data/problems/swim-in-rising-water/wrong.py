# Starts the clock at 0 instead of at the start cell's own elevation, so a
# tall starting cell is never waited for.
class Solution:
    def swimInWater(self, grid):
        n = len(grid)
        best = [[float("inf")] * n for _ in range(n)]
        best[0][0] = 0
        heap = [(0, 0, 0)]
        while heap:
            t, r, c = heappop(heap)
            if (r, c) == (n - 1, n - 1):
                return t
            if t > best[r][c]:
                continue
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < n and 0 <= nc < n:
                    nt = max(t, grid[nr][nc])
                    if nt < best[nr][nc]:
                        best[nr][nc] = nt
                        heappush(heap, (nt, nr, nc))
        return best[n - 1][n - 1]
