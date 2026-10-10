class Solution:
    def minFallingPathSum(self, matrix):
        # Every start column and every sequence of moves (-1, 0 or +1 per
        # row); keep the paths that stay inside the grid.
        n = len(matrix)
        best = None
        for start in range(n):
            for moves in itertools.product((-1, 0, 1), repeat=n - 1):
                c, total = start, matrix[0][start]
                for r, step in enumerate(moves, 1):
                    c += step
                    if not 0 <= c < n:
                        break
                    total += matrix[r][c]
                else:
                    if best is None or total < best:
                        best = total
        return best
