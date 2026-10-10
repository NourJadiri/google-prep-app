## Approach

**Sort — but remember who's who.** A place is all about order (1st place is the highest score), so sorting is the natural move. The catch is the output: `answer[i]` has to describe athlete `i`, in the original order. Sort the scores themselves and you can no longer tell which athlete each score belonged to.

The fix is a pattern worth knowing by name: **sort the indices, not the values** (often called "argsort"). Take the list `0, 1, …, n-1` and sort it by each index's score, highest first: `sorted(range(n), key=lambda i: score[i], reverse=True)`. Now the list names the athletes in finishing order — the first index is the winner, the second came second, and so on. Walk it with `enumerate`: the athlete at position `place` (counting from 0) finished in place `place + 1`, so write their label into `answer[i]` — a medal for the first three, `str(place + 1)` from then on.

Trace Example 1, `[12,40,7,25]`. Sorted by score, highest first, the indices are `1, 3, 0, 2`. So athlete 1 gets Gold, athlete 3 Silver, athlete 0 Bronze and athlete 2 gets `"4"`: `["Bronze Medal","Gold Medal","4","Silver Medal"]`.

**The heap version** does the same thing one athlete at a time. Push `(-score, index)` for every athlete — negated, because `heapq` hands out the smallest first — then pop `n` times: the pops come out in finishing order, each carrying the index to write to. For a full ranking, sorting and the heap are both `O(n log n)`. The heap pays off when you need only the first few places: `heapify` is `O(n)` and each pop `O(log n)`, so finding the three medal winners costs `O(n)` instead of a full sort.

A third way: sort the scores from high to low, build a dictionary `{score: place}`, and look up each athlete's score. That works because the scores are distinct.

How to spot it next time: you need sorted order to work something out, but the answer must be reported in the input's original order. Sort the indices — or `(value, index)` pairs — never the bare values.

## Complexity

`O(n log n)` time for the sort, plus `O(n)` for the labelling pass. `O(n)` extra space for the order and the answer.

## Pitfalls

- Returning the labels in sorted order instead of writing each one back to the athlete's original position.
- Off-by-one places: with `enumerate` counting from 0, fourth place sits at position 3, so its label is `str(3 + 1)`.
- Comparing every athlete with every other to count who scored higher. It's correct, but `O(n^2)` — the large tests will time out.
- Labels must match exactly — `"Gold Medal"`, not `"Gold"` — and places are strings, not integers.
