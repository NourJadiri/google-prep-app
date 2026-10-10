# Checks that the goal is open but never checks the start, so it happily walks
# out of a blocked top-left cell.
class Solution:
    def shortestPathBinaryMatrix(self, grid):
        n = len(grid)
        if grid[n - 1][n - 1] == 1:
            return -1
        seen = {(0, 0)}
        queue = deque([(0, 0, 1)])
        while queue:
            r, c, length = queue.popleft()
            if (r, c) == (n - 1, n - 1):
                return length
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    x, y = r + dr, c + dc
                    if 0 <= x < n and 0 <= y < n and grid[x][y] == 0 and (x, y) not in seen:
                        seen.add((x, y))
                        queue.append((x, y, length + 1))
        return -1
