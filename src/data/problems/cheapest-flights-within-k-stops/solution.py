class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:
        graph = defaultdict(list)
        for u, v, price in flights:
            graph[u].append((v, price))

        # Dijkstra over (city, flights taken). Entries pop cheapest first, so if
        # this city was already expanded using no more flights than now, this
        # entry offers nothing new: no lower cost, no more flights to spare.
        # That's the only reason to skip. A plain "seen" set would also throw
        # away pricier arrivals that still have flights to spare.
        fewest = [math.inf] * n          # fewest flights city was expanded with
        heap = [(0, src, 0)]             # (cost, city, flights taken)
        while heap:
            cost, city, used = heappop(heap)
            if city == dst:
                return cost
            if used >= fewest[city] or used == k + 1:   # k stops = k + 1 flights
                continue
            fewest[city] = used
            for nxt, price in graph[city]:
                heappush(heap, (cost + price, nxt, used + 1))
        return -1
