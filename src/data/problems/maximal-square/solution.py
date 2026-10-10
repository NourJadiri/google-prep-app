class Solution:
    def maximalSquare(self, matrix: List[List[str]]) -> int:
        n = len(matrix[0])
        # prev[j + 1] / cur[j + 1] = side of the largest all-ones square whose
        # bottom-right corner is (previous / current row, j). Index 0 is a
        # border of zeros, so the first column needs no special case.
        prev = [0] * (n + 1)
        best = 0
        for row in matrix:
            cur = [0] * (n + 1)
            for j in range(1, n + 1):
                if row[j - 1] == "1":
                    # The square is capped by the smallest of the three squares
                    # ending just above, just left, and diagonally up-left.
                    cur[j] = 1 + min(prev[j], cur[j - 1], prev[j - 1])
                    best = max(best, cur[j])
            prev = cur
        return best * best
