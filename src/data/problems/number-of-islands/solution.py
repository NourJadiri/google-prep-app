class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n = len(grid), len(grid[0])
        islands = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] != "1":
                    continue
                # Unvisited land: a new island. Count it, then sink all of it
                # so the scan can never count it again.
                islands += 1
                grid[r][c] = "0"
                stack = [(r, c)]
                while stack:
                    i, j = stack.pop()
                    for x, y in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                        if 0 <= x < m and 0 <= y < n and grid[x][y] == "1":
                            grid[x][y] = "0"  # sink on push: no cell is stacked twice
                            stack.append((x, y))
        return islands
