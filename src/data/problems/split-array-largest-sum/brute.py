class Solution:
    def splitArray(self, nums, k):
        n = len(nums)
        prefix = [0]
        for x in nums:
            prefix.append(prefix[-1] + x)
        INF = float("inf")
        # best[j][i]: the smallest possible largest-piece sum when the first
        # i numbers are cut into exactly j non-empty pieces.
        best = [[INF] * (n + 1) for _ in range(k + 1)]
        best[0][0] = 0
        for j in range(1, k + 1):
            for i in range(j, n + 1):
                for m in range(j - 1, i):
                    best[j][i] = min(best[j][i], max(best[j - 1][m], prefix[i] - prefix[m]))
        return best[k][n]
