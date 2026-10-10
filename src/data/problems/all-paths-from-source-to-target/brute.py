from collections import deque


class Solution:
    def allPathsSourceTarget(self, graph):
        # Breadth-first over whole partial paths: extend every path by every
        # edge out of its last node until it reaches the target.
        target = len(graph) - 1
        done, queue = [], deque([[0]])
        while queue:
            path = queue.popleft()
            if path[-1] == target:
                done.append(path)
                continue
            for nxt in graph[path[-1]]:
                queue.append(path + [nxt])
        return done
