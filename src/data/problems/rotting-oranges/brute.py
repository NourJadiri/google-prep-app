# Simulate the crate minute by minute: rot every fresh orange that touches a
# rotten one (all at once), until a minute passes with no change.
class Solution:
    def orangesRotting(self, grid):
        g = [row[:] for row in grid]
        m, n = len(g), len(g[0])
        minutes = 0
        while True:
            turning = []
            for r in range(m):
                for c in range(n):
                    if g[r][c] == 1 and any(
                            0 <= x < m and 0 <= y < n and g[x][y] == 2
                            for x, y in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1))):
                        turning.append((r, c))
            if not turning:
                break
            for r, c in turning:
                g[r][c] = 2
            minutes += 1
        if any(v == 1 for row in g for v in row):
            return -1
        return minutes
