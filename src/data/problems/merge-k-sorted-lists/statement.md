# Merge k Sorted Lists

## The task

You're given `lists`, an array of `k` singly linked lists, each sorted in non-decreasing order. Merge them into one linked list, also in non-decreasing order, and return its head. Relinking the existing nodes is fine (it's what a good answer does), and so is building new ones.

Each list is written as an array of its values, front to back. An empty list is `[]` and its head is `None`, and the result is shown the same way. `lists` itself may be empty, and any list inside it may be empty.

## Examples

**Example 1**

```
lists = [[2,6,9],[1,6],[3,4,10]]   -> [1,2,3,4,6,6,9,10]
```

Equal values from different lists both stay, like the two `6`s here.

**Example 2**

```
lists = []   -> []
```

With no lists at all, return `None`.

**Example 3**

```
lists = [[],[-3,-3],[]]   -> [-3,-3]
```

Empty lists contribute nothing.

## Constraints

- `0 <= k <= 10^4`, where `k` is the length of `lists`
- Each list has between `0` and `500` nodes.
- `-10^4 <= Node.val <= 10^4`
- Every list is sorted in non-decreasing order.
- At most `3 * 10^4` nodes in total across all the lists.

## Aim for

`O(N log k)` time, where `N` is the total number of nodes. Merging the lists into an accumulator one at a time, or scanning all `k` heads for the minimum at every step, costs `O(N k)`. That's fine for a handful of lists and far too slow for ten thousand. Instead, keep the `k` current heads in a min-heap and repeatedly take the smallest, or merge the lists in pairs, round after round, the way merge sort does. Either way, say what the extra space is.

## Follow-ups

- Heap or pairwise merging: which would you ship, and what does each cost in extra space?
- The lists are huge sorted files on disk, and only a few records from each fit in memory at once.
- Return just the first `m` values of the merged result without merging everything.
