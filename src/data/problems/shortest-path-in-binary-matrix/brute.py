# Bellman-Ford style: give the start length 1, then keep relaxing every open
# cell from its eight neighbours until a full sweep changes nothing.
class Solution:
    def shortestPathBinaryMatrix(self, grid):
        n = len(grid)
        INF = float("inf")
        best = [[INF] * n for _ in range(n)]
        if grid[0][0] == 0:
            best[0][0] = 1
        changed = True
        while changed:
            changed = False
            for r in range(n):
                for c in range(n):
                    if grid[r][c] == 1:
                        continue
                    for x in range(r - 1, r + 2):
                        for y in range(c - 1, c + 2):
                            if 0 <= x < n and 0 <= y < n and best[x][y] + 1 < best[r][c]:
                                best[r][c] = best[x][y] + 1
                                changed = True
        return best[n - 1][n - 1] if best[n - 1][n - 1] < INF else -1
