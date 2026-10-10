class Solution:
    def minFallingPathSum(self, matrix: List[List[int]]) -> int:
        # best[c] = the cheapest falling path from the top that ends in column
        # c of the row just processed. Each row needs only the row above.
        n = len(matrix)
        best = matrix[0][:]
        for row in matrix[1:]:
            # best[max(c - 1, 0):c + 2] is the cells above-left, above and
            # above-right, clipped at the grid's edges.
            best = [row[c] + min(best[max(c - 1, 0):c + 2]) for c in range(n)]
        return min(best)
