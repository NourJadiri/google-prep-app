# Number of Islands II

Stands in for LeetCode 305 (premium). Original statement written for this app — same task, own words and examples.

## The task

An `m x n` patch of ocean starts as all water. Volcanic vents push up land one cell at a time: `positions[i] = [r, c]` means cell `(r, c)` becomes land at step `i`. Two land cells belong to the same island when they touch horizontally or vertically.

After **each** step, report how many islands exist. Return the list of counts.

Implement `numIslands2(m, n, positions)`, returning a list with one count per position, in order.

## Examples

**Example 1**

```
m = 2, n = 3, positions = [[0,0],[0,2],[1,2],[0,1]]
                                -> [1,2,2,1]
```

Step by step: `(0,0)` rises — one island. `(0,2)` rises far away — two. `(1,2)` touches `(0,2)` — still two. `(0,1)` lands between both groups and welds them into one.

**Example 2**

```
m = 1, n = 1, positions = [[0,0],[0,0]]
                                -> [1,1]
```

A vent can fire twice at the same spot; the second eruption changes nothing. Don't let it double-count.

## Constraints

- `1 <= m, n <= 10^4`, `1 <= positions.length <= 10^4`
- `m * n <= 10^4`
- `positions[i] = [r, c]` with `0 <= r < m` and `0 <= c < n`; the same cell may appear more than once.
- Answer after every position, not just at the end.

## Aim for

`O(k · α)` for `k` positions — effectively linear — with union-find keyed by `r * n + c`. The counter is the elegant part: `+1` when a cell becomes land, `-1` for **each successful union** with a distinct neighbouring set. Re-running islands-counting DFS after every step is `O(k · m · n)` and is precisely the wrong answer here; say why before you code.

## Follow-ups

- Where does path compression matter, and what is α actually doing for you?
- What if land could also *sink*? (Union-find can't un-union — what would you reach for instead?)
- How would you answer only the final count with far less machinery?
- The ocean is `10^9 x 10^9` and only the eruptions are given — what has to change in your data structure?
