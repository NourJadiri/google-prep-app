# Relative Ranks

## The task

`score[i]` is the score of the `i`-th athlete in a competition, and no two scores are equal. Athletes are placed by score, highest first: the best score takes 1st place, the next best 2nd place, and so on.

Each athlete's rank is written like this:

- 1st place: `"Gold Medal"`
- 2nd place: `"Silver Medal"`
- 3rd place: `"Bronze Medal"`
- 4th place and below: the place number as a string — `"4"`, `"5"`, and so on.

Return a list `answer` as long as `score`, where `answer[i]` is the rank of the `i`-th athlete. The athletes stay in their original order.

## Examples

**Example 1**

```
score = [12,40,7,25]   -> ["Bronze Medal","Gold Medal","4","Silver Medal"]
```

`40` wins, `25` comes second, `12` third and `7` fourth — and each label goes back to that athlete's original position.

**Example 2**

```
score = [88]   -> ["Gold Medal"]
```

A lone athlete wins.

**Example 3**

```
score = [3,9,1,7,5,2]   -> ["4","Gold Medal","6","Silver Medal","Bronze Medal","5"]
```

## Constraints

- `n == score.length`
- `1 <= n <= 10^4`
- `0 <= score[i] <= 10^6`
- All the values in `score` are distinct.

## Aim for

The ranking comes from sorted order, but the answer has to come back in the original order — and sorting the scores alone loses track of who scored what. What could you sort instead, so that every position in the sorted order still tells you which athlete it belongs to? (A heap of pairs works too.) `O(n log n)` time.

## Follow-ups

- Ties are now allowed: equal scores share a rank, and the next rank is skipped (`1, 2, 2, 4`). What changes?
- You only need the three medal winners. Can you avoid sorting everyone?
- Scores keep arriving, and at any moment you must report an athlete's current place.
