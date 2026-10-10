class Solution:
    def uniquePaths(self, m, n):
        # Walk every route explicitly and count the ones that arrive.
        def walk(r, c):
            if r == m - 1 and c == n - 1:
                return 1
            routes = 0
            if r + 1 < m:
                routes += walk(r + 1, c)
            if c + 1 < n:
                routes += walk(r, c + 1)
            return routes

        return walk(0, 0)
