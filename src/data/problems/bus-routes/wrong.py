# Forgets that you may already be standing at the target: with source ==
# target it boards a bus anyway (or gives up if no bus stops there).
class Solution:
    def numBusesToDestination(self, routes, source, target):
        buses_at = defaultdict(list)
        for bus, stops in enumerate(routes):
            for stop in stops:
                buses_at[stop].append(bus)
        seen_bus = set(buses_at[source])
        seen_stop = {source}
        queue = deque((bus, 1) for bus in seen_bus)
        while queue:
            bus, taken = queue.popleft()
            for stop in routes[bus]:
                if stop == target:
                    return taken
                if stop in seen_stop:
                    continue
                seen_stop.add(stop)
                for nxt in buses_at[stop]:
                    if nxt not in seen_bus:
                        seen_bus.add(nxt)
                        queue.append((nxt, taken + 1))
        return -1
