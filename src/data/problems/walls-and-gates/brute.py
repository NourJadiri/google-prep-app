from collections import deque


class Solution:
    def wallsAndGates(self, rooms):
        OPEN = 2147483647
        m, n = len(rooms), len(rooms[0])
        answer = [row[:] for row in rooms]
        # From every open cell on its own, search outward until an exit turns up.
        for sr in range(m):
            for sc in range(n):
                if rooms[sr][sc] != OPEN:
                    continue
                seen = {(sr, sc)}
                queue = deque([(sr, sc, 0)])
                while queue:
                    r, c, d = queue.popleft()
                    if rooms[r][c] == 0:
                        answer[sr][sc] = d
                        break
                    for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                        if 0 <= nr < m and 0 <= nc < n and rooms[nr][nc] != -1 and (nr, nc) not in seen:
                            seen.add((nr, nc))
                            queue.append((nr, nc, d + 1))
        for r in range(m):
            rooms[r][:] = answer[r]
