class Solution:
    def wallsAndGates(self, rooms: List[List[int]]) -> None:
        """
        Do not return anything, modify rooms in-place instead.
        """
        OPEN = 2147483647
        m, n = len(rooms), len(rooms[0])
        # Seed the queue with every exit at once: the BFS then grows rings
        # around all exits together, and the first ring to touch an open cell
        # is the distance to its nearest exit.
        queue = deque((r, c) for r in range(m) for c in range(n) if rooms[r][c] == 0)
        while queue:
            r, c = queue.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < m and 0 <= nc < n and rooms[nr][nc] == OPEN:
                    rooms[nr][nc] = rooms[r][c] + 1    # written once, never revisited
                    queue.append((nr, nc))
