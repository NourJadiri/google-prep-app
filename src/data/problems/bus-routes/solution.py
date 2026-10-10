class Solution:
    def numBusesToDestination(self, routes: List[List[int]], source: int, target: int) -> int:
        if source == target:
            return 0
        buses_at = defaultdict(list)            # stop -> the buses that serve it
        for bus, stops in enumerate(routes):
            for stop in stops:
                buses_at[stop].append(bus)

        # BFS over buses, not stops: layer k is every bus you can be riding
        # after boarding k buses. Riding one bus any distance costs one.
        boarded = set(buses_at[source])
        queue = deque(boarded)
        buses = 1
        while queue:
            for _ in range(len(queue)):
                bus = queue.popleft()
                for stop in routes[bus]:
                    if stop == target:
                        return buses
                    # Every bus at this stop is queued now, so the stop never
                    # needs expanding again: pop it from the map.
                    for nxt in buses_at.pop(stop, ()):
                        if nxt not in boarded:
                            boarded.add(nxt)
                            queue.append(nxt)
            buses += 1
        return -1
