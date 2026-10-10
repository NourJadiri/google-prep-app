# Floods only right and down, as if a scan in reading order could never need
# to turn back: a U or a J gets counted as two islands.
class Solution:
    def numIslands(self, grid):
        m, n = len(grid), len(grid[0])

        def sink(r, c):
            if r >= m or c >= n or grid[r][c] != "1":
                return
            grid[r][c] = "0"
            sink(r + 1, c)
            sink(r, c + 1)

        count = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] == "1":
                    count += 1
                    sink(r, c)
        return count
