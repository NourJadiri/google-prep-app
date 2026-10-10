# Sliding Window Maximum

## The task

You get an integer array `nums` and a window width `k`. The window starts over the first `k` elements and slides right one position at a time until it covers the last `k`, which makes `n - k + 1` positions. Return a list of the window's maximum at each position, in order.

## Examples

**Example 1**

```
nums = [2,7,3,1,5,4,0], k = 3   -> [7,7,5,5,5]
```

The windows are `[2,7,3]`, `[7,3,1]`, `[3,1,5]`, `[1,5,4]` and `[5,4,0]`. Once `7` slides out, `5` takes over.

**Example 2**

```
nums = [-4,2,-1], k = 1   -> [-4,2,-1]
```

A window of width one is just each element on its own.

**Example 3**

```
nums = [3,3,-2,3], k = 4   -> [3]
```

When `k` equals the length, there's a single window.

## Constraints

- `1 <= nums.length <= 10^5`
- `-10^4 <= nums[i] <= 10^4`
- `1 <= k <= nums.length`

## Aim for

Recomputing each window's maximum costs `O(n k)`, which is hopeless when both are around `5 * 10^4`. A heap with lazy deletion gets `O(n log n)`. The target is `O(n)` with a **monotonic deque** of indices whose values decrease from front to back, so the front is always the current maximum. Before pushing a new index, pop from the back every index whose value isn't bigger than the new one, since those can never be a maximum again. Pop the front once it slides out of the window.

## Follow-ups

- Sliding window *minimum*, or both at once.
- Report each window's median instead of its maximum.
- `k` is huge and the data is a stream. How much memory can the deque need in the worst case, and on what input?
