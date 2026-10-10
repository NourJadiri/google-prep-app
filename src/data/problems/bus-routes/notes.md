## Approach

The cost is the number of buses you board, not the distance you travel: once you're on a bus, every stop on its route costs the same. So the natural graph has **buses as nodes**, with an edge between two buses that share a stop, because you can change there. The answer is the shortest path in that graph from any bus serving `source` to any bus serving `target`, counted in buses, so the starting buses count as 1. The edges are unweighted and there are several starting points, so this is a multi-source BFS.

You can build the bus graph explicitly by intersecting every pair of routes. That costs `O(R·N)` in the worst case, for `R` routes holding `N` stops in total. Here it runs in about half a second on the 500-bus test, so it's a perfectly good interview answer. There's also a leaner way that never builds the graph at all. Keep a map from each stop to the buses that serve it, and seed the queue with every bus at `source`: that's layer 1. To expand a bus, walk its stops. If one of them is `target`, the current layer is the answer. Otherwise, every bus at that stop that you haven't boarded yet joins the next layer.

Two kinds of visited marks make it linear:

- **Buses.** Each bus is queued at most once, so each route is walked at most once.
- **Stops.** Once a stop's list of buses has been scanned, it never needs scanning again, because every bus on it is already queued. The reference pops the stop from the map. Without this, a hub stop served by 500 buses gets rescanned by every bus that passes through it.

The classic slow version runs the BFS over *stops*: pop a stop, and for each bus at it, push all of that bus's stops. If you don't also mark buses, a 50,000-stop route is walked again for each of its 50,000 stops. That's 2.5 billion steps, and the two-long-routes test never finishes.

`source == target` is answered before any search: zero buses, even if no bus serves that stop.

## Complexity

`O(N)` time and space, where `N = sum(routes[i].length)`. Building the map touches each (stop, bus) pair once, each route is walked at most once, and each stop's list is scanned at most once.

## Pitfalls

- Forgetting `source == target`. The answer is 0: not 1, and not -1 when no bus serves that stop.
- Running a BFS over stops without marking buses as used, so long routes are walked again and again.
- Counting stops, or transfers (buses minus one), instead of buses.
