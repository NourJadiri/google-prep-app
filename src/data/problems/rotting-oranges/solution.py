class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        queue = deque()
        fresh = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] == 2:
                    queue.append((r, c))
                elif grid[r][c] == 1:
                    fresh += 1

        # Multi-source BFS: every rotten orange starts in the queue at minute 0,
        # and each pass of the outer loop spreads the rot one ring further.
        minutes = 0
        while queue and fresh:
            minutes += 1
            for _ in range(len(queue)):
                r, c = queue.popleft()
                for x, y in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= x < m and 0 <= y < n and grid[x][y] == 1:
                        grid[x][y] = 2  # rot on push, so no orange is queued twice
                        fresh -= 1
                        queue.append((x, y))
        return minutes if fresh == 0 else -1
