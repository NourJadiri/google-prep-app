# Union-find over land cells: join every land cell to the land below it and to
# its right, then count the cells that are their own root.
class Solution:
    def numIslands(self, grid):
        m, n = len(grid), len(grid[0])
        parent = list(range(m * n))

        def find(x):
            while parent[x] != x:
                x = parent[x]
            return x

        def union(a, b):
            parent[find(a)] = find(b)

        for r in range(m):
            for c in range(n):
                if grid[r][c] == "1":
                    if r + 1 < m and grid[r + 1][c] == "1":
                        union(r * n + c, (r + 1) * n + c)
                    if c + 1 < n and grid[r][c + 1] == "1":
                        union(r * n + c, r * n + c + 1)
        return sum(1 for r in range(m) for c in range(n)
                   if grid[r][c] == "1" and find(r * n + c) == r * n + c)
