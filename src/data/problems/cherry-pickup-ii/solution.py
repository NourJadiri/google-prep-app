class Solution:
    def cherryPickup(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        near = [[d for d in (c - 1, c, c + 1) if 0 <= d < cols] for c in range(cols)]
        # best[a][b] = the most cherries collected from the top row down to the
        # current one, with robot A in column a and robot B in column b; -1
        # marks pairs the robots can't reach yet. They never need to cross
        # (swap their routes at a crossing and the total is the same), so only
        # a <= b is filled in.
        best = [[-1] * cols for _ in range(cols)]
        best[0][cols - 1] = grid[0][0] + grid[0][cols - 1]
        for row in grid[1:]:
            nxt = [[-1] * cols for _ in range(cols)]
            for a in range(cols):
                for b in range(a, cols):
                    prev = max(best[pa][pb] for pa in near[a] for pb in near[b])
                    if prev >= 0:
                        # a shared cell is picked only once
                        nxt[a][b] = prev + row[a] + (row[b] if a != b else 0)
            best = nxt
        return max(map(max, best))
