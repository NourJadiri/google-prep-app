class Solution:
    def validTree(self, n, edges):
        # Straight from the definition: connected, and no cycle.
        adj = [[] for _ in range(n)]
        for a, b in edges:
            adj[a].append(b)
            adj[b].append(a)
        parent = [-2] * n          # -2: unvisited
        parent[0] = -1
        stack = [0]
        while stack:
            u = stack.pop()
            for v in adj[u]:
                if v == parent[u]:
                    continue
                if parent[v] != -2:
                    return False   # reached a visited node by a second route: a cycle
                parent[v] = u
                stack.append(v)
        return all(p != -2 for p in parent)
