## Approach

Without the stop limit this would be plain shortest paths, and Dijkstra would do. The limit changes what "the best way to reach a city" means. A cheap arrival isn't automatically best, because the number of flights already used matters too. In Example 1, city `1` is cheapest via `0 → 2 → 1` (cost `2`, two flights), but with `k = 1` that leaves no flight to continue to `3`. The pricier direct `0 → 1` (cost `5`, one flight) can still go on. Neither arrival dominates the other, so the search state has to be **(city, flights taken)**, not just the city.

**Dijkstra over states** (the reference). Push `(cost, city, flights)` and pop cheapest first. When `dst` pops, its cost is the answer, because every itinerary still in the heap costs at least as much. Here's where the seen-set rule bends. A popped state may be skipped only when its city was already expanded with **no more flights than now**. That earlier expansion was no more expensive (it popped first) and has at least as many flights to spare, so anything the new state could reach, the old one already reached for less. Track `fewest[city]`, the fewest flights the city has been expanded with. Skip when `used >= fewest[city]`, and never expand a state that has already used all `k + 1` flights. A city is only expanded with `0` to `k` flights used, each time with strictly fewer than before, so at most `k + 1` times.

**Bellman-Ford with `k + 1` rounds** is the shortest correct code. `prices[v]` is the cheapest known way to reach `v`. Each round relaxes every flight `u → v` from the prices of the *previous* round, kept as a copy, so after round `i` the prices cover trips of at most `i` flights. After `k + 1` rounds, read off `prices[dst]`. The copy is essential. Relaxing in place lets a single round chain several flights (`0 → 2`, then `2 → 1`), quietly breaking the limit.

## Complexity

Dijkstra over states: at most `k + 1` expansions per city means `O(k * E)` pushes, so `O(k * E log(k * E))` time and `O(k * E)` heap space. It often stops early, as soon as `dst` pops. Bellman-Ford: `O(k * E)` time and `O(n)` space, with no early exit. At this size both are instant. Bellman-Ford is the least code. Dijkstra wins when `k` is large but the cheap routes are short.

## Pitfalls

- A plain visited set on cities (the BFS and Dijkstra habit). It settles a city on its cheapest arrival even when that arrival can't fly on.
- Relaxing in place in Bellman-Ford. Each round may add at most one flight.
- The off-by-one: `k` stops means `k + 1` flights.
