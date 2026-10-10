class Solution:
    def allPathsSourceTarget(self, graph: List[List[int]]) -> List[List[int]]:
        target = len(graph) - 1
        paths, path = [], [0]

        def dfs(node):
            if node == target:
                paths.append(path[:])   # a copy: `path` keeps changing after this
                return
            for nxt in graph[node]:
                path.append(nxt)        # choose
                dfs(nxt)                # explore
                path.pop()              # un-choose

        # No visited set: the graph has no cycles, so a path can never return
        # to a node, and different paths are allowed to share nodes.
        dfs(0)
        return paths
