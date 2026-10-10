# One BFS per exit, each only flowing into rooms that are still open: the
# first exit claims every room it can reach, even rooms nearer a later exit.
class Solution:
    def wallsAndGates(self, rooms):
        OPEN = 2147483647
        m, n = len(rooms), len(rooms[0])
        for r0 in range(m):
            for c0 in range(n):
                if rooms[r0][c0] != 0:
                    continue
                queue = deque([(r0, c0)])
                while queue:
                    r, c = queue.popleft()
                    for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                        if 0 <= nr < m and 0 <= nc < n and rooms[nr][nc] == OPEN:
                            rooms[nr][nc] = rooms[r][c] + 1
                            queue.append((nr, nc))
