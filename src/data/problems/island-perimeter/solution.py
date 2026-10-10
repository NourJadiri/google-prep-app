class Solution:
    def islandPerimeter(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        perimeter = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 0:
                    continue
                # A side of a land cell is coastline when the cell across it is
                # water or lies off the map.
                for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
                    if not (0 <= nr < rows and 0 <= nc < cols) or grid[nr][nc] == 0:
                        perimeter += 1
        return perimeter
