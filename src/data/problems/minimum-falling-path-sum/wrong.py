# Greedy: starts at the smallest top cell and always steps to the smallest cell below.
class Solution:
    def minFallingPathSum(self, matrix):
        n = len(matrix)
        c = min(range(n), key=lambda k: matrix[0][k])
        total = matrix[0][c]
        for r in range(1, n):
            c = min((d for d in (c - 1, c, c + 1) if 0 <= d < n), key=lambda d: matrix[r][d])
            total += matrix[r][c]
        return total
