# Only looks for a cycle. A forest with no loops passes too — it never checks
# that every switch is connected.
class Solution:
    def validTree(self, n, edges):
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                x = parent[x]
            return x

        for a, b in edges:
            ra, rb = find(a), find(b)
            if ra == rb:
                return False
            parent[ra] = rb
        return True
