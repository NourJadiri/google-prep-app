class Solution:
    def numIslands2(self, m: int, n: int, positions: List[List[int]]) -> List[int]:
        parent, size = {}, {}           # union-find over land cells, keyed by r * n + c

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]      # path halving
                x = parent[x]
            return x

        counts, islands = [], 0
        for r, c in positions:
            cell = r * n + c
            if cell not in parent:                 # a repeat eruption changes nothing
                parent[cell], size[cell] = cell, 1
                islands += 1                       # new land is its own island...
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    nb = nr * n + nc
                    if 0 <= nr < m and 0 <= nc < n and nb in parent:
                        a, b = find(cell), find(nb)
                        if a != b:                 # ...minus one per merge that really happens
                            if size[a] < size[b]:
                                a, b = b, a
                            parent[b] = a
                            size[a] += size[b]
                            islands -= 1
            counts.append(islands)
        return counts
