# Random Pick with Weight

## The task

You're given a list of positive integers `w`, where `w[i]` is the weight of index `i`. Implement `class Solution`:

- `Solution(w)` — takes the weights
- `pickIndex()` — returns a random index `i` from `0` to `len(w) - 1`, where index `i` comes back with probability `w[i] / sum(w)`

With `w = [1, 3]`, `pickIndex()` should return `0` about a quarter of the time and `1` about three quarters of the time.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. Picks are random, so they aren't compared one by one: the expected output is `null` for the constructor and `"ok"` for each `pickIndex`, and the checker records `"ok"` in place of every index that is in range (or a sentence describing the problem when one isn't). After the last pick it counts how often each index came up and checks that every count is close to its share, `w[i] / sum(w)` of the picks. The bounds are loose enough that a correct solution passes essentially every time, and tight enough to catch picks that ignore the weights or are off by one on small weights.

## Examples

**Example 1**

```
ops  = ["Solution","pickIndex"]
args = [[[7]],[]]
                                -> [null,"ok"]
```

One index holds all the weight, so every pick must be `0`.

**Example 2**

```
ops  = ["Solution","pickIndex","pickIndex","pickIndex","pickIndex"]
args = [[[1,3]],[],[],[],[]]
                                -> [null,"ok","ok","ok","ok"]
```

Each pick is `1` with probability `3/4` and `0` with probability `1/4`; a run like `1, 1, 0, 1` is as fine as `1, 1, 1, 1`. Four picks are too few to judge the frequencies — the hidden tests make thousands.

**Example 3**

```
ops  = ["Solution","pickIndex","pickIndex","pickIndex"]
args = [[[2,5,3]],[],[],[]]
                                -> [null,"ok","ok","ok"]
```

Out of a total weight of `10`, index `0` should come up 20% of the time, index `1` half the time and index `2` 30%.

## Constraints

- `1 <= w.length <= 10^4`
- `1 <= w[i] <= 10^5`
- `pickIndex` is called at most `10^4` times.

## Aim for

`O(n)` to build, `O(log n)` per pick, `O(n)` space. Lay the weights end to end: the running totals `w[0], w[0] + w[1], …, sum(w)` cut the integers `1..sum(w)` into one block per index, block `i` exactly `w[i]` long. Roll a uniform integer in `1..sum(w)` and binary-search for the first running total that reaches it. Scanning for the block instead is `O(n)` per pick — say why that's too slow at `10^4` picks over `10^4` weights. Make the range of the roll and the search agree on their boundaries; that's where the bugs live.

## Follow-ups

- The weights change between picks (`update(i, value)`). What replaces the array of running totals?
- Make each pick `O(1)` after preprocessing. (Look up Vose's alias method — what does building it cost?)
- Pick `k` distinct indices, each round weighted by what's left.
