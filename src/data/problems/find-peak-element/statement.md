# Find Peak Element

## The task

You get an integer array `nums` in which no two neighbouring entries are equal. Index `i` is a **peak** if `nums[i]` is strictly greater than each neighbour it has. Treat the positions just outside the array as minus infinity: the first and last entries only have to beat their one neighbour, and a one-element array is a peak by itself.

Return the index of any peak. Every such array has at least one, and when there are several, any of them is accepted.

## Examples

**Example 1**

```
nums = [1,5,2,8,3]   -> 3
```

Both `5` (index 1) and `8` (index 3) beat their neighbours, so `1` is accepted too.

**Example 2**

```
nums = [9,6,4,-2]   -> 0
```

The values only fall, so the first entry is the peak. Its missing left neighbour counts as minus infinity.

**Example 3**

```
nums = [7]   -> 0
```

## Constraints

- `1 <= nums.length <= 1000`
- `-2^31 <= nums[i] <= 2^31 - 1`
- `nums[i] != nums[i + 1]` for every valid `i`

## Aim for

A linear scan is easy, so say it and move on. The point of the question is `O(log n)`: binary search on an array that isn't sorted. Compare `nums[mid]` with `nums[mid + 1]`. If the step rises, a peak lies to the right; if it falls, there's a peak at `mid` or to its left. Keep the half that's guaranteed to contain a peak until one index remains. At this input size the tests can't time the difference, but an interviewer will ask for it.

## Follow-ups

- Why must the half you keep contain a peak? State the invariant.
- Find a peak in a 2D grid: an entry larger than all four of its neighbours.
- What breaks if neighbouring entries can be equal?
