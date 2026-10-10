# Forgets the edge of the map: only counts sides that face a water cell inside
# the grid, so coastline along the border goes missing.
class Solution:
    def islandPerimeter(self, grid):
        rows, cols = len(grid), len(grid[0])
        perimeter = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:
                            perimeter += 1
        return perimeter
