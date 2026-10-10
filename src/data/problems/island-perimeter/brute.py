from collections import Counter


class Solution:
    def islandPerimeter(self, grid):
        # Name every side of every land cell by its two corner points. A side
        # shared by two land cells is named twice and lies inland; the
        # coastline is every side named exactly once.
        sides = Counter()
        for r, row in enumerate(grid):
            for c, cell in enumerate(row):
                if cell == 1:
                    sides[(r, c), (r, c + 1)] += 1          # top
                    sides[(r + 1, c), (r + 1, c + 1)] += 1  # bottom
                    sides[(r, c), (r + 1, c)] += 1          # left
                    sides[(r, c + 1), (r + 1, c + 1)] += 1  # right
        return sum(1 for times in sides.values() if times == 1)
