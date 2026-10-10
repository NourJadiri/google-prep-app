class Solution:
    def minimumEffortPath(self, heights: List[List[int]]) -> int:
        rows, cols = len(heights), len(heights[0])
        # effort[r][c]: the smallest "hardest step" of any route found so far to (r, c)
        effort = [[math.inf] * cols for _ in range(rows)]
        effort[0][0] = 0
        heap = [(0, 0, 0)]
        while True:                          # the target is always reachable
            e, r, c = heappop(heap)
            if r == rows - 1 and c == cols - 1:
                return e                     # popped means settled: nothing left can beat it
            if e > effort[r][c]:
                continue                     # stale entry: a better route already got here
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols:
                    # a route's effort is its worst step, so extend with max, not +
                    ne = max(e, abs(heights[nr][nc] - heights[r][c]))
                    if ne < effort[nr][nc]:
                        effort[nr][nc] = ne
                        heappush(heap, (ne, nr, nc))
