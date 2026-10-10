# Marks a node as done when it's first pushed (the BFS habit), so the first
# time found for a node is final even if a faster route turns up later.
class Solution:
    def networkDelayTime(self, times, n, k):
        graph = defaultdict(list)
        for u, v, w in times:
            graph[u].append((v, w))
        arrival = {k: 0}
        heap = [(0, k)]
        while heap:
            t, u = heappop(heap)
            for v, w in graph[u]:
                if v not in arrival:
                    arrival[v] = t + w
                    heappush(heap, (t + w, v))
        return max(arrival.values()) if len(arrival) == n else -1
