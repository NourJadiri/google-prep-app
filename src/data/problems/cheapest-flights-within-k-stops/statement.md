# Cheapest Flights Within K Stops

## The task

There are `n` cities, numbered `0` to `n - 1`, connected by one-way flights: `flights[i] = [from, to, price]` means you can fly from city `from` to city `to` for `price`.

Find the cheapest trip from city `src` to city `dst` with **at most `k` stops**. A stop is any city you land in strictly between `src` and `dst`, so the trip may use at most `k + 1` flights. Return the total price of the cheapest such trip, or `-1` if there is none.

## Examples

**Example 1**

```
n = 4, flights = [[0,1,5],[0,2,1],[2,1,1],[1,3,1]], src = 0, dst = 3, k = 1   -> 6
```

`0 → 1 → 3` costs `6` with one stop. `0 → 2 → 1 → 3` costs only `3`, but it needs two stops.

**Example 2**

```
n = 4, flights = [[0,1,5],[0,2,1],[2,1,1],[1,3,1]], src = 0, dst = 3, k = 2   -> 3
```

With two stops allowed, the cheaper route counts.

**Example 3**

```
n = 3, flights = [[0,1,4],[1,2,4]], src = 0, dst = 2, k = 0   -> -1
```

`k = 0` means direct flights only, and there is no direct flight from `0` to `2`.

## Constraints

- `2 <= n <= 100`
- `0 <= flights.length <= n * (n - 1) / 2`
- `flights[i].length == 3`
- `0 <= from, to < n` and `from != to`
- `1 <= price <= 10^4`
- At most one flight for each ordered pair of cities.
- `0 <= src, dst, k < n` and `src != dst`

## Aim for

Start by saying why plain Dijkstra on cities fails. The cheapest arrival at a city may have spent every flight it was allowed, and settling the city on that arrival throws away a pricier one that still had flights to spare (Example 1). There are two clean fixes. The first is Bellman-Ford capped at `k + 1` rounds, where each round relaxes every flight from a *copy* of the previous round's prices, so round `i` means "at most `i` flights": `O(k * E)` time, `O(n)` space. The second is Dijkstra over states `(city, flights used)`, skipping a state only when its city was already expanded with no more flights, for `O(k * E log(k * E))`.

## Follow-ups

- Return the itinerary along with the price.
- Among the cheapest trips, return the one with the fewest stops.
- Flights also have durations, and the cap is now a total travel time instead of a number of stops. What's the state now, and what does the search cost?
