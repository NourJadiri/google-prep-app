# Permutations

## The task

Given a list `nums` of **distinct** integers, return every permutation of it: every ordering that uses each element exactly once. The permutations can come in any order; inside a permutation, the order is the whole point.

## Examples

**Example 1**

```
nums = [4,-1,7]   -> [[4,-1,7],[4,7,-1],[-1,4,7],[-1,7,4],[7,4,-1],[7,-1,4]]
```

Three choices for the first slot, two for the second, one for the last: `3! = 6` orderings.

**Example 2**

```
nums = [9]   -> [[9]]
```

## Constraints

- `1 <= nums.length <= 6`
- `-10 <= nums[i] <= 10`
- All the numbers in `nums` are distinct.

## Aim for

`n!` permutations of length `n`, so `O(n · n!)` time is forced by the output. Fill the slots left to right with backtracking: for each element not used yet, choose it (mark it used and append it), explore the next slot, then un-choose (pop and unmark). Record a copy when all `n` slots are full. Then mention the in-place variant: swap each candidate into position `k`, recurse on `k + 1`, swap it back.

## Follow-ups

- `nums` may contain duplicates: return each distinct ordering once. (Sort, then skip a value equal to an unused neighbour on its left.)
- Rearrange `nums` into the next permutation in lexicographic order, in place with `O(1)` extra space.
- Return only the `k`-th permutation in lexicographic order, without generating the ones before it.
