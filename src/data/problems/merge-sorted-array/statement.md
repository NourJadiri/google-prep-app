# Merge Sorted Array

## The task

You're given two integer lists, `nums1` and `nums2`, each sorted in non-decreasing order, and two counts, `m` and `n`.

- The first `m` slots of `nums1` hold its real values. After them come `n` spare slots holding `0` as placeholders, so `nums1` has length `m + n`.
- `nums2` holds exactly `n` values.

Merge all `m + n` real values into `nums1`, sorted in non-decreasing order. Do it **in place**: the result has to end up in the very `nums1` list you were given. Your function returns nothing. The tests read `nums1` after your call, and that's the output the examples show.

## Examples

**Example 1**

```
nums1 = [2,5,8,0,0], m = 3, nums2 = [1,6], n = 2   -> [1,2,5,6,8]
```

The real values are `2,5,8` and `1,6`. The two trailing zeros in `nums1` were only room to grow into.

**Example 2**

```
nums1 = [0,0,0], m = 0, nums2 = [-4,0,9], n = 3   -> [-4,0,9]
```

With `m = 0`, every slot of `nums1` is a placeholder. The `0` in the answer is a real value that came from `nums2`.

**Example 3**

```
nums1 = [4,4,7], m = 3, nums2 = [], n = 0   -> [4,4,7]
```

Nothing to merge: `nums1` is already the answer.

## Constraints

- `nums1.length == m + n` and `nums2.length == n`
- `0 <= m, n <= 200` and `1 <= m + n <= 200`
- `-10^9 <= nums1[i], nums2[j] <= 10^9`
- The first `m` values of `nums1` and all of `nums2` are sorted in non-decreasing order. The last `n` slots of `nums1` hold `0`.

## Aim for

`O(m + n)` time and `O(1)` extra space. Merging from the front would mean shoving values out of the way to make room. Where in `nums1` is the free space? Start filling there, and at each step ask: which list holds the largest value I haven't placed yet?

## Follow-ups

- Why does filling from the back never overwrite a `nums1` value you still need?
- `nums1` has no spare room and you must return a new list instead. Which direction would you merge in now?
- Merge `k` sorted lists instead of two.
