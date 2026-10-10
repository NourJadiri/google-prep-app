class Solution:
    def validTree(self, n: int, edges: List[List[int]]) -> bool:
        # A tree on n nodes has exactly n - 1 edges. With exactly that many,
        # "connected" and "no cycle" imply each other, so union-find only has
        # to confirm that no cable joins two switches that are already linked.
        if len(edges) != n - 1:
            return False
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]    # path halving
                x = parent[x]
            return x

        for a, b in edges:
            ra, rb = find(a), find(b)
            if ra == rb:
                return False                     # this cable closes a loop
            parent[ra] = rb
        return True
