# Treats every cable as one-way (from u to v only), so a route that uses a
# cable "backwards" is never found.
class Solution:
    def validPath(self, n, edges, source, destination):
        graph = [[] for _ in range(n)]
        for u, v in edges:
            graph[u].append(v)
        seen = {source}
        stack = [source]
        while stack:
            node = stack.pop()
            if node == destination:
                return True
            for nxt in graph[node]:
                if nxt not in seen:
                    seen.add(nxt)
                    stack.append(nxt)
        return False
