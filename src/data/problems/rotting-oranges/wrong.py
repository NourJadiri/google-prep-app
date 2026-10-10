# Counts a minute for every BFS round, including the last round, which rots
# nothing: one minute too many (and 1 instead of 0 when nothing is fresh).
class Solution:
    def orangesRotting(self, grid):
        m, n = len(grid), len(grid[0])
        queue = deque()
        fresh = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] == 2:
                    queue.append((r, c))
                elif grid[r][c] == 1:
                    fresh += 1
        minutes = 0
        while queue:
            for _ in range(len(queue)):
                r, c = queue.popleft()
                for x, y in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= x < m and 0 <= y < n and grid[x][y] == 1:
                        grid[x][y] = 2
                        fresh -= 1
                        queue.append((x, y))
            minutes += 1
        return minutes if fresh == 0 else -1
