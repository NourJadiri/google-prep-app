# Follow the rain itself: from every cell, explore everywhere water can flow
# (to neighbours no higher) and see which shores the explored area touches.
class Solution:
    def pacificAtlantic(self, heights):
        m, n = len(heights), len(heights[0])
        result = []
        for sr in range(m):
            for sc in range(n):
                seen = {(sr, sc)}
                todo = [(sr, sc)]
                pacific = atlantic = False
                while todo:
                    r, c = todo.pop()
                    if r == 0 or c == 0:
                        pacific = True
                    if r == m - 1 or c == n - 1:
                        atlantic = True
                    for x, y in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                        if 0 <= x < m and 0 <= y < n and (x, y) not in seen \
                                and heights[x][y] <= heights[r][c]:
                            seen.add((x, y))
                            todo.append((x, y))
                if pacific and atlantic:
                    result.append([sr, sc])
        return result
