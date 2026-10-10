# Top K Frequent Elements

## The task

You get an integer list `nums` and an integer `k`. A value's *frequency* is how many times it appears in `nums`. Return the `k` distinct values with the highest frequencies, in any order.

Each value appears in the answer at most once, however often it occurs. The answer is guaranteed to be unique: the value ranked `k`-th by frequency occurs strictly more often than the one ranked `(k + 1)`-th, so there's never a tie to break at the cut-off. Values tied *inside* the top `k` all belong in the answer.

## Examples

**Example 1**

```
nums = [4,4,1,4,7,1,9], k = 2   -> [4,1]
```

`4` appears three times, `1` twice, `7` and `9` once each.

**Example 2**

```
nums = [3,-2,3,-2,5,-2,3,0], k = 2   -> [3,-2]
```

`3` and `-2` tie with three appearances each, and both make the cut because everything else appears once. `[-2,3]` is just as correct.

**Example 3**

```
nums = [8], k = 1   -> [8]
```

A single element is its own top 1.

## Constraints

- `1 <= nums.length <= 10^5`
- `-10^4 <= nums[i] <= 10^4`
- `k` is between `1` and the number of distinct values in `nums`.
- The answer is unique.

## Aim for

Counting takes one pass with a hash map. The interesting part is picking the top `k` out of the counts. Sorting the distinct values by count is `O(n log n)`, so say that first. A min-heap capped at `k` entries gets you to `O(n log k)`. The best answer is `O(n)`: no count can exceed `n`, so bucket the values in an array indexed by frequency, then walk it from the top until you've collected `k`.

## Follow-ups

- The values arrive as an endless stream and you can't keep a counter for every distinct value. What do you give up? (Approximate heavy hitters: Misra–Gries, Count–Min sketch.)
- The counts are spread across 100 machines. Why is "take each machine's local top `k` and merge them" wrong, and what would you do instead?
- Now ties at the cut-off are allowed and you must break them by the smaller value. What changes?
