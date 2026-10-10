class Solution:
    def numIslands2(self, m, n, positions):
        land = [[False] * n for _ in range(m)]
        out = []
        for r, c in positions:
            land[r][c] = True
            # Recount from scratch: flood-fill every island.
            seen = [[False] * n for _ in range(m)]
            islands = 0
            for i in range(m):
                for j in range(n):
                    if land[i][j] and not seen[i][j]:
                        islands += 1
                        seen[i][j] = True
                        stack = [(i, j)]
                        while stack:
                            x, y = stack.pop()
                            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                                if 0 <= nx < m and 0 <= ny < n and land[nx][ny] and not seen[nx][ny]:
                                    seen[nx][ny] = True
                                    stack.append((nx, ny))
            out.append(islands)
        return out
