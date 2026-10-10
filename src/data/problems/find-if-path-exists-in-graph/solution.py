class Solution:
    def validPath(self, n: int, edges: List[List[int]], source: int, destination: int) -> bool:
        graph = [[] for _ in range(n)]
        for u, v in edges:
            graph[u].append(v)      # a cable works both ways,
            graph[v].append(u)      # so record it from both ends

        seen = {source}
        queue = deque([source])
        while queue:
            node = queue.popleft()
            if node == destination:
                return True
            for nxt in graph[node]:
                if nxt not in seen:
                    seen.add(nxt)   # mark when queued, so nothing is queued twice
                    queue.append(nxt)
        return False
