# Keeps a visited set for the whole search, as a reachability DFS would: once
# a node has been reached, every later path through it is lost.
class Solution:
    def allPathsSourceTarget(self, graph):
        target = len(graph) - 1
        paths, path, visited = [], [0], {0}

        def dfs(node):
            if node == target:
                paths.append(path[:])
                return
            for nxt in graph[node]:
                if nxt not in visited:
                    visited.add(nxt)
                    path.append(nxt)
                    dfs(nxt)
                    path.pop()

        dfs(0)
        return paths
