# Last Stone Weight

## The task

You have a pile of stones, and `stones[i]` is the weight of the `i`-th stone. Play the following game until at most one stone is left:

- Take the two heaviest stones. Call their weights `x` and `y`, with `x <= y`.
- If `x == y`, both stones are destroyed.
- If `x < y`, the lighter stone is destroyed and the heavier one goes back on the pile with weight `y - x`.

Return the weight of the last stone left, or `0` if no stones remain.

## Examples

**Example 1**

```
stones = [3,7,2,9]   -> 1
```

Smash `9` and `7`: a stone of weight `2` goes back, so the pile is `[3,2,2]`. Smash `3` and `2`: the pile is `[2,1]`. Smash `2` and `1`: one stone of weight `1` is left.

**Example 2**

```
stones = [5,5]   -> 0
```

Equal weights destroy each other, and nothing is left.

**Example 3**

```
stones = [8]   -> 8
```

A single stone has nothing to smash against.

## Constraints

- `1 <= stones.length <= 30`
- `1 <= stones[i] <= 1000`

## Aim for

Every round needs the two largest items, and afterwards a new item may join. Re-sorting every round works (and is fine for 30 stones), but this is the job a heap is made for: it gives you the extreme item and takes in a new one in `O(log n)` each. Python's `heapq` only ever hands you the *smallest* item — what simple change to the numbers you store turns it into a max-heap? `O(n log n)` overall.

## Follow-ups

- Sorting the pile once and then smashing from the top goes wrong. Why — and when does it happen to give the right answer anyway?
- You may smash any two stones you like, not just the heaviest. What's the smallest weight that can be left? (It stops being a heap problem.)
- With a million stones, how does re-sorting every round compare with the heap?
