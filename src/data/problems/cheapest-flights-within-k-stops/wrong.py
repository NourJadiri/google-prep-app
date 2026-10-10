# Plain Dijkstra with a visited set. The cheapest arrival settles a city for
# good, even when it used up every allowed flight and a pricier arrival, with
# flights to spare, was the only way on to dst.
class Solution:
    def findCheapestPrice(self, n, flights, src, dst, k):
        graph = defaultdict(list)
        for u, v, price in flights:
            graph[u].append((v, price))
        seen = set()
        heap = [(0, src, 0)]
        while heap:
            cost, city, used = heappop(heap)
            if city == dst:
                return cost
            if city in seen:
                continue
            seen.add(city)
            if used == k + 1:
                continue
            for nxt, price in graph[city]:
                heappush(heap, (cost + price, nxt, used + 1))
        return -1
