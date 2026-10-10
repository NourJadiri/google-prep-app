# Bus Routes

## The task

`routes[i]` lists the stops served by bus `i`, which drives that loop forever. Once you're on bus `i`, you can ride it to any of its stops. You start at stop `source`, not on any bus yet, and want to reach stop `target`. You can travel only by bus, and you may change buses at any stop both of them serve.

Return the fewest buses you must take to get from `source` to `target`, or `-1` if it can't be done. If `source == target`, the answer is `0`.

## Examples

**Example 1**

```
routes = [[1,4,6],[6,9,3],[3,8]], source = 1, target = 8   -> 3
```

Bus 0 from stop 1 to stop 6, bus 1 from 6 to 3, then bus 2 from 3 to 8. How many stops you pass doesn't matter, only how many buses you board.

**Example 2**

```
routes = [[2,5]], source = 7, target = 7   -> 0
```

You're already there. No bus is needed, even though none serves stop 7.

**Example 3**

```
routes = [[1,2],[3,4]], source = 1, target = 4   -> -1
```

The two routes share no stop, so you can never change from one to the other.

## Constraints

- `1 <= routes.length <= 500`
- `1 <= routes[i].length <= 10^5`
- The stops within each `routes[i]` are distinct.
- `sum(routes[i].length) <= 10^5`
- `0 <= routes[i][j] < 10^6`
- `0 <= source, target < 10^6`

## Aim for

A BFS where each node is a **bus**, not a stop: the cost is buses boarded, and any distance on one bus is free. Map each stop to the buses that serve it. Start with every bus at `source` (one bus boarded), and let each BFS layer board one more. Mark buses as visited, and scan each stop's list of buses only once, so the whole search is `O(N)` for `N` stops across all routes. A BFS over stops that re-walks a long route for every stop on it is quadratic.

## Follow-ups

- Return the actual itinerary: which bus to take, between which stops.
- Minimise the number of stops travelled instead of buses. What does the graph look like now?
- Every transfer costs a different waiting time. What replaces BFS?
