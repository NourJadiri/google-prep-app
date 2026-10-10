# Decrements the count for every road, even one between two cities that are
# already in the same province — any cycle of roads is over-counted.
class Solution:
    def findCircleNum(self, isConnected):
        n = len(isConnected)
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                x = parent[x]
            return x

        count = n
        for i in range(n):
            for j in range(i + 1, n):
                if isConnected[i][j]:
                    parent[find(i)] = find(j)
                    count -= 1
        return count
