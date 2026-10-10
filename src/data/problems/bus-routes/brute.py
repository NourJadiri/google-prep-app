# Build the bus-to-bus graph by intersecting every pair of routes, then BFS
# from all the buses that serve the source, with a distance table.
class Solution:
    def numBusesToDestination(self, routes, source, target):
        if source == target:
            return 0
        stops = [set(r) for r in routes]
        n = len(routes)
        adj = [[j for j in range(n) if j != i and stops[i] & stops[j]] for i in range(n)]
        dist = {i: 1 for i in range(n) if source in stops[i]}
        order = list(dist)
        for i in order:
            if target in stops[i]:
                return dist[i]
            for j in adj[i]:
                if j not in dist:
                    dist[j] = dist[i] + 1
                    order.append(j)
        return -1
