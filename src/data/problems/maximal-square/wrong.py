# Forgets the diagonal: a cell with a square above it and a square to its
# left looks like the corner of a bigger square even when the cell up-left
# is a "0" -- an L of three ones becomes a 2 x 2 square.
class Solution:
    def maximalSquare(self, matrix):
        n = len(matrix[0])
        prev = [0] * (n + 1)
        best = 0
        for row in matrix:
            cur = [0] * (n + 1)
            for j in range(1, n + 1):
                if row[j - 1] == "1":
                    cur[j] = 1 + min(prev[j], cur[j - 1])
                    best = max(best, cur[j])
            prev = cur
        return best * best
