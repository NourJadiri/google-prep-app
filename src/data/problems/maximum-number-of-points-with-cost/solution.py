class Solution:
    def maxPoints(self, points: List[List[int]]) -> int:
        n = len(points[0])
        # best[c] = the highest score so far whose pick in the latest row is
        # column c. The next row needs max over k of best[k] - |k - c| for
        # every c; split on which side of c the column k lies and sweep.
        best = points[0][:]
        for row in points[1:]:
            # from_left[c] = max over k <= c of best[k] - (c - k): one step
            # further right costs every candidate one more point.
            from_left = best[:]
            for c in range(1, n):
                from_left[c] = max(from_left[c], from_left[c - 1] - 1)
            # from_right[c] = max over k >= c of best[k] - (k - c).
            from_right = best[:]
            for c in range(n - 2, -1, -1):
                from_right[c] = max(from_right[c], from_right[c + 1] - 1)
            best = [row[c] + max(from_left[c], from_right[c]) for c in range(n)]
        return max(best)
