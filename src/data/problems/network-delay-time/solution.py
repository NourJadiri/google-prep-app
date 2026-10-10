class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        graph = defaultdict(list)
        for u, v, w in times:
            graph[u].append((v, w))

        arrival = {}                    # node -> its final (earliest) arrival time
        heap = [(0, k)]
        while heap:
            t, u = heappop(heap)
            if u in arrival:            # stale entry: u was already settled, sooner
                continue
            arrival[u] = t              # the smallest time in the heap can't improve
            for v, w in graph[u]:
                if v not in arrival:
                    heappush(heap, (t + w, v))
        return max(arrival.values()) if len(arrival) == n else -1
