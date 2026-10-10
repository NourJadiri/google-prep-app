# Network Delay Time

## The task

A network has `n` nodes labelled `1` to `n`. Each entry `times[i] = [u, v, w]` is a one-way link: a signal leaving node `u` arrives at node `v` exactly `w` time units later. A link carries signals only from `u` to `v`, never back.

At time `0`, node `k` sends out a signal. Every node that receives it immediately passes it on along all of its outgoing links. Return the time at which the last node receives the signal, which is the earliest moment when every node has it. If some node can never receive it, return `-1`.

## Examples

**Example 1**

```
times = [[1,2,9],[1,3,2],[3,2,3],[2,4,1],[3,4,8]], n = 4, k = 1   -> 6
```

Node `3` hears at time `2`. Node `2` hears at `5` via node `3`, which beats its direct link (`9`). Node `4` hears at `6` via node `2`. The last arrival is at time `6`.

**Example 2**

```
times = [[2,1,4],[2,3,1]], n = 3, k = 1   -> -1
```

Node `1` has no outgoing links. The link between `1` and `2` only runs from `2` to `1`.

**Example 3**

```
times = [], n = 1, k = 1   -> 0
```

The only node has the signal from the start.

## Constraints

- `1 <= k <= n <= 100`
- `0 <= times.length <= 6000`
- `times[i].length == 3`
- `1 <= u, v <= n` and `u != v`
- `0 <= w <= 100`
- No two links share the same `(u, v)` pair.

## Aim for

Single-source shortest paths with non-negative weights calls for Dijkstra. Keep a min-heap of `(time, node)`. Pop the earliest entry, skip it if that node is already settled, otherwise settle it and push each neighbour at `time + w`. The answer is the largest settled time, or `-1` if fewer than `n` nodes got settled. With a lazy heap that's `O(E log E)` time and `O(V + E)` space.

## Follow-ups

- Some links have negative delays, but there are no negative loops. Which algorithm do you switch to, and what does it cost?
- Several nodes broadcast at time `0`. What changes?
- Scale to `10^5` nodes and `2 * 10^5` links. Does your implementation still fit, and what dominates?
