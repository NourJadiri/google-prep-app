# Walls and Gates

Stands in for LeetCode 286 (premium). Original statement written for this app — same task, own words and examples.

## The task

You are given the floor plan of a data centre as an `m x n` grid of integers:

- `-1` — a locked rack you cannot walk through
- `0` — an emergency exit
- `2147483647` — open floor (that's `2^31 - 1`, standing in for "infinitely far")

Fill every open cell with the number of steps to its **nearest** exit, moving up/down/left/right one cell per step. If a cell cannot reach any exit, leave it as `2147483647`. Modify the grid in place.

Implement `wallsAndGates(rooms)`: it receives the grid as `rooms`, changes it in place and returns nothing — the tests look at `rooms` after the call.

## Examples

**Example 1**

```
rooms = [[0,2147483647,2147483647],
         [-1,-1,2147483647],
         [2147483647,2147483647,2147483647]]
                                -> [[0,1,2],[-1,-1,3],[6,5,4]]
```

The only exit is the top-left corner; distance wraps clockwise around the locked racks.

**Example 2**

```
rooms = [[2147483647,0,2147483647,2147483647],
         [2147483647,-1,2147483647,0]]
                                -> [[1,0,1,1],[2,-1,1,0]]
```

Two exits. Each open cell takes whichever exit is closer — that is the whole point.

**Example 3**

```
rooms = [[2147483647,-1],[-1,2147483647]]
                                -> [[2147483647,-1],[-1,2147483647]]
```

Nobody can reach anything. Both open cells stay `2147483647`.

## Constraints

- `1 <= m, n <= 250`
- Every cell is `-1`, `0`, or `2147483647`.
- There may be zero exits.

## Aim for

`O(m·n)` time, one pass. The trick that makes it one pass instead of one-BFS-per-cell is the day's whole lesson: seed the queue with **every** exit at once and expand rings outward. The first time a ring touches an open cell is, by BFS's promise, its true distance — write it and never revisit.

## Follow-ups

- Why is BFS from the exits better than BFS from each open cell? (Complexity of both.)
- What changes with diagonal movement? With weighted floor tiles? (Say "Dijkstra" and mean it.)
- Could you do it without mutating the input?
