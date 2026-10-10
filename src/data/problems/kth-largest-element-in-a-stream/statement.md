# Kth Largest Element in a Stream

## The task

A game's leaderboard always shows one number: the score you'd have to beat to break into the top `k`. Design `class KthLargest` to keep that number up to date as scores arrive:

- `KthLargest(k, nums)` — starts with the integer `k` and a list `nums` of scores already recorded (possibly empty).
- `add(val)` — records the score `val`, then returns the `k`-th largest score recorded so far, counting `nums` and every value added.

The `k`-th largest is the value in position `k` when every recorded score is sorted from largest to smallest, duplicates included — it is not the `k`-th largest *distinct* value. Every call to `add` happens when at least `k` scores have been recorded, counting the new one.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation, `null` for the constructor.

## Examples

**Example 1**

```
ops  = ["KthLargest","add","add","add","add"]
args = [[2,[9,1,5]],[3],[12],[8],[10]]
                                           -> [null,5,9,9,10]
```

With `k = 2`: after `add(3)` the scores, sorted, are `9, 5, 3, 1`, so the answer is `5`. After `12` arrives it's `9`, and `8` doesn't change that. After `10`, the top two are `12` and `10`.

**Example 2**

```
ops  = ["KthLargest","add","add","add","add"]
args = [[3,[4,4,1]],[4],[10],[6],[7]]
                                           -> [null,4,4,4,6]
```

Duplicates count separately: after `add(4)` the scores are `4, 4, 4, 1`, and the third largest is `4`.

**Example 3**

```
ops  = ["KthLargest","add","add","add"]
args = [[1,[]],[-3],[-5],[0]]
                                           -> [null,-3,-3,0]
```

The list starts empty, and with `k = 1` each `add` returns the largest score so far.

## Constraints

- `0 <= nums.length <= 10^4`
- `1 <= k <= nums.length + 1`
- `-10^4 <= nums[i], val <= 10^4`
- At most `10^4` calls to `add`.

## Aim for

Ask which scores could ever be the answer again. Once `k` scores at least as large as some score have been recorded, that score is out of the running for good — later arrivals can only push it further down. So you never need more than `k` scores. Which structure keeps a collection with its smallest item always on hand, and lets you remove that item or add a new one in `O(log k)`? That's `O(log k)` per `add` and `O(k)` memory.

## Follow-ups

- Support removing a score too. What breaks, and what would you use instead?
- `k` changes from call to call — or you need the median of the stream.
- The scores are small integers in a known range. Can you beat the heap?
