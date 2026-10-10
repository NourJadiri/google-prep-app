class Solution:
    def findCircleNum(self, isConnected: List[List[int]]) -> int:
        n = len(isConnected)
        parent = list(range(n))          # every city starts as its own province

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]   # path halving: hop to the grandparent
                x = parent[x]
            return x

        provinces = n
        for i in range(n):
            for j in range(i + 1, n):    # symmetric matrix: the upper triangle is enough
                if isConnected[i][j]:
                    ri, rj = find(i), find(j)
                    if ri != rj:         # a road between two provinces merges them;
                        parent[ri] = rj  # a road inside one changes nothing
                        provinces -= 1
        return provinces
